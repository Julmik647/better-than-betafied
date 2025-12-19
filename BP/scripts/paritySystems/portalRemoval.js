// Ruined Portal Removal
// Removes crying obsidian, gold blocks from ruined portals, and netherrack
// Since structure_sets may not work in 1.20.30+, this script removes the blocks

import { world, system } from "@minecraft/server";
console.warn("[Betafied] Portal Removal System Loaded");

const RUINED_PORTAL_BLOCKS = new Set([
    "minecraft:crying_obsidian",
    "minecraft:netherrack",
    "minecraft:magma"
]);

// Check around players and remove portal blocks
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        try {
            const dimension = player.dimension;
            const px = Math.floor(player.location.x);
            const py = Math.floor(player.location.y);
            const pz = Math.floor(player.location.z);
            
            const RADIUS = 32;
            
            for (let dx = -RADIUS; dx <= RADIUS; dx += 4) {
                for (let dy = -16; dy <= 16; dy += 4) {
                    for (let dz = -RADIUS; dz <= RADIUS; dz += 4) {
                        const block = dimension.getBlock({ 
                            x: px + dx, 
                            y: py + dy, 
                            z: pz + dz 
                        });
                        
                        if (block && RUINED_PORTAL_BLOCKS.has(block.typeId)) {
                            // Replace with air or stone depending on y level
                            if (py + dy < 0) {
                                block.setType("minecraft:stone");
                            } else {
                                block.setType("minecraft:air");
                            }
                        }
                    }
                }
            }
        } catch (e) {}
    }
}, 100); // Every 5 seconds
