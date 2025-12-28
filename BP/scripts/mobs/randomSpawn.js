import { world, system } from "@minecraft/server";
console.warn("[keirazelle] Random Spawn Module Loaded");

const CONFIG = Object.freeze({
    MIN_X: -1000,
    MAX_X: 1000,
    MIN_Z: -1000,
    MAX_Z: 1000,
    MAX_ATTEMPTS: 10,
    CHUNK_LOAD_DELAY: 40,
    SPAWN_IMMUNITY_TICKS: 200,
    SPAWN_IMMUNITY_LEVEL: 255,
    SEARCH_Y_MAX: 120,
    SEARCH_Y_MIN: 40,
    WATER_CHECK_Y_MIN: 62,
    WATER_CHECK_Y_MAX: 70
});

const SURFACE_BLOCKS = Object.freeze(new Set([
    "minecraft:grass_block", "minecraft:grass",
    "minecraft:dirt", "minecraft:sand",
    "minecraft:gravel", "minecraft:stone",
    "minecraft:snow", "minecraft:snow_layer",
    "minecraft:sandstone", "minecraft:clay"
]));

const SKIP_BLOCKS = Object.freeze(new Set([
    "minecraft:water", "minecraft:lava", "minecraft:air"
]));

let worldSpawnSet = false;
const pendingSpawns = new Map();

function isWaterLocation(dimension, x, z) {
    for (let y = CONFIG.WATER_CHECK_Y_MIN; y < CONFIG.WATER_CHECK_Y_MAX; y++) {
        try {
            const block = dimension.getBlock({ x, y, z });
            if (block?.typeId === "minecraft:water") return true;
        } catch (e) {
            console.warn(`[randomSpawn] water check error at ${x},${y},${z}: ${e}`);
        }
    }
    return false;
}

function findSafeGround(dimension, x, z) {
    for (let y = CONFIG.SEARCH_Y_MAX; y > CONFIG.SEARCH_Y_MIN; y--) {
        try {
            const block = dimension.getBlock({ x, y, z });
            const above1 = dimension.getBlock({ x, y: y + 1, z });
            const above2 = dimension.getBlock({ x, y: y + 2, z });

            if (!block || !above1 || !above2) continue;

            const type = block.typeId;

            if (SKIP_BLOCKS.has(type)) continue;
            if (above1.typeId !== "minecraft:air" || above2.typeId !== "minecraft:air") continue;

            return y + 1;
        } catch (e) {
            console.warn(`[randomSpawn] ground check error at ${x},${y},${z}: ${e}`);
        }
    }
    return -1;
}

function getRandomCoords() {
    return {
        x: Math.floor(Math.random() * (CONFIG.MAX_X - CONFIG.MIN_X)) + CONFIG.MIN_X,
        z: Math.floor(Math.random() * (CONFIG.MAX_Z - CONFIG.MIN_Z)) + CONFIG.MIN_Z
    };
}

function attemptSpawn(player, attempt = 1) {
    if (!player.isValid()) {
        pendingSpawns.delete(player.id);
        console.warn(`[randomSpawn] player disconnected during spawn`);
        return;
    }

    if (attempt > CONFIG.MAX_ATTEMPTS) {
        console.warn(`[randomSpawn] max attempts reached for ${player.name}, using fallback`);
        player.teleport({ x: 0.5, y: 80, z: 0.5 });
        player.addTag("spawned");
        pendingSpawns.delete(player.id);
        return;
    }

    const coords = getRandomCoords();
    pendingSpawns.set(player.id, { coords, attempt });

    // tp high to load chunk
    player.teleport({ x: coords.x + 0.5, y: CONFIG.SEARCH_Y_MAX, z: coords.z + 0.5 });
    player.addEffect("resistance", CONFIG.SPAWN_IMMUNITY_TICKS, {
        amplifier: CONFIG.SPAWN_IMMUNITY_LEVEL,
        showParticles: false
    });

    system.runTimeout(() => {
        try {
            if (!player.isValid()) {
                pendingSpawns.delete(player.id);
                return;
            }

            // check for water
            if (isWaterLocation(player.dimension, coords.x, coords.z)) {
                console.warn(`[randomSpawn] water at ${coords.x},${coords.z} - retry ${attempt}`);
                attemptSpawn(player, attempt + 1);
                return;
            }

            const groundY = findSafeGround(player.dimension, coords.x, coords.z);

            if (groundY === -1) {
                console.warn(`[randomSpawn] no ground at ${coords.x},${coords.z} - retry ${attempt}`);
                attemptSpawn(player, attempt + 1);
                return;
            }

            // success
            player.teleport({ x: coords.x + 0.5, y: groundY, z: coords.z + 0.5 });

            try {
                player.dimension.runCommand(`setworldspawn ${coords.x} ${groundY} ${coords.z}`);
            } catch (e) {
                console.warn(`[randomSpawn] setworldspawn failed: ${e}`);
            }

            player.addTag("spawned");
            worldSpawnSet = true;
            pendingSpawns.delete(player.id);

            console.warn(`[randomSpawn] success: ${coords.x},${groundY},${coords.z} (attempt ${attempt})`);
        } catch (e) {
            console.warn(`[randomSpawn] spawn error: ${e}`);
            pendingSpawns.delete(player.id);
        }
    }, CONFIG.CHUNK_LOAD_DELAY);
}

world.afterEvents.playerSpawn.subscribe((event) => {
    const player = event.player;

    if (!event.initialSpawn) return;
    if (player.hasTag("spawned")) return;

    if (!worldSpawnSet) {
        system.run(() => attemptSpawn(player));
    } else {
        player.addTag("spawned");
    }
});

// cleanup on disconnect
world.afterEvents.playerLeave.subscribe((event) => {
    pendingSpawns.delete(event.playerId);
});
