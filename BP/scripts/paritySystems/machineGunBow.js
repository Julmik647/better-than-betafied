import { world, system } from "@minecraft/server";
console.warn("[Betafied] Machine Gun Bow Loaded");

// beta 1.7.3 machine gun bow - no draw time, instant fire
console.warn("[Betafied] Machine Gun Bow Script Loaded");

// track bow usage
const bowCooldowns = new Map();

world.afterEvents.itemUse.subscribe((event) => {
    try {
        const player = event.source;
        const item = event.itemStack;
        
        if (!player || !item) return;
        if (item.typeId !== "minecraft:bow") return;
        
        // check cooldown (5 ticks = 0.25s between shots)
        const now = system.currentTick;
        const lastShot = bowCooldowns.get(player.id) || 0;
        if (now - lastShot < 5) return;
        
        // check for arrows
        const inventory = player.getComponent("inventory")?.container;
        if (!inventory) return;
        
        let hasArrow = false;
        let arrowSlot = -1;
        
        for (let i = 0; i < inventory.size; i++) {
            const slot = inventory.getItem(i);
            if (slot && slot.typeId === "minecraft:arrow") {
                hasArrow = true;
                arrowSlot = i;
                break;
            }
        }
        
        if (!hasArrow) return;
        
        // consume arrow (survival only)
        if (player.getGameMode() !== "creative") {
            const arrowStack = inventory.getItem(arrowSlot);
            if (arrowStack.amount > 1) {
                arrowStack.amount -= 1;
                inventory.setItem(arrowSlot, arrowStack);
            } else {
                inventory.setItem(arrowSlot, undefined);
            }
        }
        
        // fire arrow
        const viewDir = player.getViewDirection();
        const spawn = {
            x: player.location.x + viewDir.x * 0.5,
            y: player.location.y + 1.5 + viewDir.y * 0.5,
            z: player.location.z + viewDir.z * 0.5
        };
        
        const arrow = player.dimension.spawnEntity("minecraft:arrow", spawn);
        
        // set arrow velocity (full power)
        const speed = 3.0;
        arrow.applyImpulse({
            x: viewDir.x * speed,
            y: viewDir.y * speed,
            z: viewDir.z * speed
        });
        
        // set cooldown
        bowCooldowns.set(player.id, now);
        
        // play sound
        player.playSound("random.bow", { volume: 1.0, pitch: 1.0 });
        
    } catch (e) {}
});

// clean up on player leave
world.afterEvents.playerLeave.subscribe((event) => {
    bowCooldowns.delete(event.playerId);
});
