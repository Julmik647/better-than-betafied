import { world, system } from "@minecraft/server";
console.warn("[Betafied] No Experience Loaded");

// no xp in beta 1.7.3

// nuke xp orbs
world.afterEvents.entitySpawn.subscribe((event) => {
    try {
        if (event.entity.typeId === "minecraft:xp_orb") {
            event.entity.remove();
        }
    } catch (e) {}
});

// clean player levels
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        try {
            if (player.level > 0 || player.xpEarnedAtCurrentLevel > 0) {
                player.resetLevel();
            }
        } catch (e) {}
    }
}, 20);
