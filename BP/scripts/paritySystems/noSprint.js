import { world, system } from "@minecraft/server";
console.warn("[Betafied] No Sprint Loaded");

// Lock hunger at 5 - just below sprint threshold (6)
// This prevents sprinting while not starving the player
// Creative mode players are excluded

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        try {
            // Skip creative mode
            if (player.getGameMode() === "creative") continue;
            
            const hunger = player.getComponent("minecraft:hunger");
            if (hunger && hunger.currentValue !== undefined) {
                // Keep hunger at 5 - can't sprint (needs 6+), won't starve (needs 0)
                if (hunger.currentValue !== 5) {
                    hunger.setCurrentValue(5);
                }
            }
        } catch (e) {}
    }
}, 10);
