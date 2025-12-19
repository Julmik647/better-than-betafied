import { world, system } from "@minecraft/server";
console.warn("[Betafied] Flat Snow Loaded");

// beta snow was always 1 layer
// using Math.floor for reliable block access

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        try {
            const dimension = player.dimension;
            
            const px = Math.floor(player.location.x);
            const py = Math.floor(player.location.y);
            const pz = Math.floor(player.location.z);
            
            const RADIUS = 16; 
            
            for (let dx = -RADIUS; dx <= RADIUS; dx++) {
                for (let dy = -8; dy <= 8; dy++) {
                    for (let dz = -RADIUS; dz <= RADIUS; dz++) {
                        const block = dimension.getBlock({ x: px + dx, y: py + dy, z: pz + dz });
                        
                        if (block && block.typeId === "minecraft:snow_layer") {
                            const height = block.permutation.getState("height");
                            
                            if (height !== 0) {
                                block.setPermutation(block.permutation.withState("height", 0));
                            }
                        }
                    }
                }
            }
        } catch (e) {}
    }
}, 20); // every second
