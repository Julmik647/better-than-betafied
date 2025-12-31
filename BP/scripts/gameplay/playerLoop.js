import { world, system, EquipmentSlot } from "@minecraft/server";
console.warn("[keirazelle] Player Loop Loaded");
const CONFIG = Object.freeze({
    TICK_INTERVAL: 20
});

// generator fn to distribute player processing across ticks
function* processPlayers() {
    const players = world.getPlayers();
    
    for (const player of players) {
        try {
            // xp removal
            if (player.level > 0 || player.xpEarnedAtCurrentLevel > 0) {
                player.resetLevel();
            }
            
            // offhand disabled, yeet back to inv
            const equippable = player.getComponent("minecraft:equippable");
            const offhandItem = equippable?.getEquipment(EquipmentSlot.Offhand);
            if (offhandItem) {
                const inv = player.getComponent("inventory")?.container;
                if (inv) {
                    const leftover = inv.addItem(offhandItem);
                    // inv full? drop it
                    if (leftover) {
                        player.dimension.spawnItem(leftover, player.location);
                    }
                }
                equippable.setEquipment(EquipmentSlot.Offhand, undefined);
            }
        } catch (e) {
            console.warn(`[playerLoop] error processing ${player?.name}: ${e}`);
        }
        
        yield;
    }
}

system.runInterval(() => {
    system.runJob(processPlayers());
}, CONFIG.TICK_INTERVAL);
