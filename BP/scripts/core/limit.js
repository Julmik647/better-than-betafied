import { world } from "@minecraft/server";
console.warn("[keirazelle] Limit System Loaded");

// Height limit system - only activate if API supports it
if (world.beforeEvents && world.beforeEvents.playerPlaceBlock) {
    world.beforeEvents.playerPlaceBlock.subscribe((event) => {
        try {
            const { player, block } = event;
            // Allow creative players to build above 128
            if (player.getGameMode() === "creative") return;

            const y = block.location.y;
            if (y >= 128) {
                event.cancel = true;
                player.sendMessage("Height limit for building is 128 blocks");
            }
        } catch (e) {
            console.warn("Error in limit.js:", e);
        }
    });
}