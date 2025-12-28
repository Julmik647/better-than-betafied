import { world, system } from "@minecraft/server";
console.warn("[keirazelle] Sword Mining System Loaded");

const SWORD_FAST_BLOCKS = Object.freeze(new Set([
    "minecraft:cobweb",
    "minecraft:web",
    "minecraft:leaves",
    "minecraft:leaves2",
    "minecraft:azalea_leaves",
    "minecraft:azalea_leaves_flowered",
    "minecraft:oak_stairs",
    "minecraft:wooden_stairs",
    "minecraft:oak_planks",
    "minecraft:planks",
    "minecraft:pumpkin",
    "minecraft:lit_pumpkin",
    "minecraft:carved_pumpkin",
    "minecraft:melon_block",
    "minecraft:wool"
]));

const SWORDS = Object.freeze(new Set([
    "minecraft:wooden_sword",
    "minecraft:stone_sword",
    "minecraft:iron_sword",
    "minecraft:golden_sword",
    "minecraft:diamond_sword"
]));

const CONFIG = Object.freeze({
    TICK_INTERVAL: 4,
    HASTE_DURATION: 3,
    HASTE_AMPLIFIER: 1,
    MAX_DISTANCE: 5
});

const lastHaste = new Map();

// direct loop - 4 tick interval is too fast for generator overhead
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        try {
            const playerId = player.id;

            const equip = player.getComponent("equippable");
            if (!equip) {
                if (lastHaste.has(playerId)) {
                    player.removeEffect("haste");
                    lastHaste.delete(playerId);
                }
                continue;
            }

            const mainhand = equip.getEquipment("Mainhand");
            const hasSword = mainhand && SWORDS.has(mainhand.typeId);

            if (!hasSword) {
                if (lastHaste.has(playerId)) {
                    player.removeEffect("haste");
                    lastHaste.delete(playerId);
                }
                continue;
            }

            const blockRay = player.getBlockFromViewDirection({ maxDistance: CONFIG.MAX_DISTANCE });
            const lookingAtFast = blockRay?.block && SWORD_FAST_BLOCKS.has(blockRay.block.typeId);

            if (lookingAtFast) {
                player.addEffect("haste", CONFIG.HASTE_DURATION, {
                    amplifier: CONFIG.HASTE_AMPLIFIER,
                    showParticles: false
                });
                lastHaste.set(playerId, true);
            } else if (lastHaste.has(playerId)) {
                player.removeEffect("haste");
                lastHaste.delete(playerId);
            }
        } catch (e) {
            console.warn(`[swordMining] error: ${e}`);
        }
    }
}, CONFIG.TICK_INTERVAL);

// cleanup on leave
world.afterEvents.playerLeave.subscribe((event) => {
    lastHaste.delete(event.playerId);
});
