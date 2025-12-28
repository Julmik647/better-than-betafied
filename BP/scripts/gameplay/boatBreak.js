import { world, system, ItemStack } from "@minecraft/server";
console.warn("[keirazelle] Boat Break Loaded");

const CONFIG = Object.freeze({
    TICK_INTERVAL: 10,
    NON_SOLID_WHITELIST: Object.freeze(["minecraft:air", "minecraft:water", "minecraft:soul_sand"])
});

function normalize(vector) {
    const mag = Math.sqrt(vector.x ** 2 + vector.z ** 2);
    if (mag === 0) return { x: 0, y: 0, z: 0 };
    return { x: vector.x / mag, y: 0, z: vector.z / mag };
}

function multiply(vector, scalar) {
    return {
        x: vector.x * scalar,
        y: vector.y * scalar,
        z: vector.z * scalar
    };
}

function isSolidBlock(block) {
    const id = block?.typeId;
    return id && !CONFIG.NON_SOLID_WHITELIST.includes(id);
}

function breakBoatWithParts(boat) {
    const loc = boat.location;
    const dim = boat.dimension;
    boat.kill();
    for (let i = 0; i < 3; i++) dim.spawnItem(new ItemStack("minecraft:oak_planks", 1), loc);
    for (let i = 0; i < 2; i++) dim.spawnItem(new ItemStack("minecraft:stick", 1), loc);
}

function breakBoatWithItem(boat) {
    const loc = boat.location;
    const dim = boat.dimension;
    boat.kill();
    dim.spawnItem(new ItemStack("minecraft:oak_boat", 1), loc);
}

// direct loop - 10 tick interval, entity count usually low
system.runInterval(() => {
    const overworld = world.getDimension("overworld");
    const boats = overworld.getEntities({ type: "minecraft:boat" });

    for (const boat of boats) {
        try {
            const loc = boat.location;
            const x = Math.floor(loc.x);
            const y = Math.floor(loc.y);
            const z = Math.floor(loc.z);

            // collision check
            const offsets = [
                { x: x + 1, z }, { x: x - 1, z },
                { x, z: z + 1 }, { x, z: z - 1 }
            ];

            let broken = false;
            for (const offset of offsets) {
                const block = overworld.getBlock({ x: offset.x, y, z: offset.z });
                if (isSolidBlock(block)) {
                    breakBoatWithParts(boat);
                    broken = true;
                    break;
                }
            }

            if (broken) continue;

            // water trails
            const vel = boat.getVelocity?.();
            if (!vel || (Math.abs(vel.x) < 0.01 && Math.abs(vel.z) < 0.01)) continue;

            const blockBelow = overworld.getBlock({
                x: Math.floor(loc.x),
                y: Math.floor(loc.y - 0.3),
                z: Math.floor(loc.z)
            });

            if (blockBelow?.typeId !== "minecraft:water") continue;

            const dir = normalize({ x: vel.x, y: 0, z: vel.z });
            const offset = multiply(dir, -1);

            const bubblePos = {
                x: loc.x + offset.x,
                y: loc.y + 0.1,
                z: loc.z + offset.z
            };

            boat.dimension.spawnParticle("minecraft:basic_bubble_particle_gradual", bubblePos);
        } catch (e) {
            console.warn(`[boatBreak] error: ${e}`);
        }
    }
}, CONFIG.TICK_INTERVAL);

// player punch -> boat item
world.afterEvents.entityHitEntity.subscribe(event => {
    const { damagingEntity, hitEntity } = event;
    if (
        damagingEntity.typeId === "minecraft:player" &&
        hitEntity.typeId === "minecraft:boat"
    ) {
        breakBoatWithItem(hitEntity);
    }
});