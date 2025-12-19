import { world } from "@minecraft/server";

export function registerDimensions() {
    // Dimension Lock - prevent End access (didn't exist in Beta 1.7.3)
    try {
        if (world.beforeEvents && world.beforeEvents.playerDimensionChange) {
            world.beforeEvents.playerDimensionChange.subscribe((event) => {
                if (event.toDimension && event.toDimension.id === "minecraft:the_end") {
                    event.cancel = true;
                    const player = event.player;
                    if (player && player.isValid()) {
                        player.sendMessage("§cThe End does not exist in Beta 1.7.3.");
                    }
                }
            });
        }
    } catch(e) {}
}
