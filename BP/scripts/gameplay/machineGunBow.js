import { world } from "@minecraft/server";

console.warn("[keirazelle] Bow Fixed");

world.beforeEvents.worldInitialize.subscribe(({ itemComponentRegistry }) => {
    itemComponentRegistry.registerCustomComponent("bh:bow_activation", {
        onUse: ({ source: player }) => {
            const isCreative = player.getGameMode() === "creative";
            
            // surv ammo check
            if (!isCreative) {
                const inv = player.getComponent("inventory")?.container;
                if (!inv) return;

                let hasArrow = false;
                for (let i = 0; i < inv.size; i++) {
                    const item = inv.getItem(i);
                    if (item?.typeId === "minecraft:arrow") {
                        if (item.amount > 1) {
                            item.amount--;
                            inv.setItem(i, item);
                        } else {
                            inv.setItem(i, undefined); // native clear
                        }
                        hasArrow = true;
                        break;
                    }
                }
                if (!hasArrow) return;
            }

            // calc
            const dir = player.getViewDirection();
            const head = player.getHeadLocation();

            const spawn = { 
                x: head.x + dir.x * 1.5, 
                y: head.y + dir.y * 1.5, 
                z: head.z + dir.z * 1.5 
            };

            try {
                const arrow = player.dimension.spawnEntity("minecraft:arrow", spawn);
                const proj = arrow.getComponent("projectile");
                
                if (proj) {
                    proj.owner = player;
                    proj.shoot(dir, { uncertainty: 1.0, power: 3.0 });
                }

                player.playSound("random.bow", { 
                    volume: 0.5, 
                    pitch: 1.1 + Math.random() * 0.4 
                });
            } catch {}
        }
    });
});
