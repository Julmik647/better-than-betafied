import { world, system } from "@minecraft/server";
console.warn("[Betafied] Island Gen Loaded");

// Prison Island Logic
// Structure: mystructure:island at 300, 60, 300
// Radius: 100 blocks
// Effect: Resistance 15 (Invincible)
// Escape prevention: Voided players strictly teleported back. If no island, loop.

const ISLAND_CENTER = { x: 300, y: 60, z: 300 };
const SPAWN_POINT = { x: 300, y: 65, z: 300 }; // Slightly above structure origin
const MAX_RADIUS_SQR = 100 * 100;
const STRUCTURE_NAME = "mystructure:island";

system.runInterval(() => {
    try {
        for (const player of world.getPlayers()) {
            if (!player.hasTag("voided")) continue;

            const dim = player.dimension;
            const loc = player.location;

            // 1. Invincibility (Resistance 255/15)
            // Resistance 5 = 100% damage reduction basically.
            player.addEffect("resistance", 100, {
                amplifier: 20,
                showParticles: false
            });
            player.addEffect("saturation", 100, {
                amplifier: 20,
                showParticles: false
            });

            // 2. Check Distance/Radius
            const dx = loc.x - ISLAND_CENTER.x;
            const dz = loc.z - ISLAND_CENTER.z;
            const distSqr = dx * dx + dz * dz;

            // 3. Check Y limit (falling off)
            const belowY = loc.y < 50; 

            // 4. Dimensional Check (Must be in Overworld or wherever island is)
            // Assuming Overworld for now unless specified.
            // If they manage to change dimension, pull them back.
            // Actually, let's assume valid dimension is whatever dim player is in? 
            // Or strictly Overworld? 300,60,300 usually implies Overworld.
            
            let shouldTeleport = false;

            if (distSqr > MAX_RADIUS_SQR || belowY) {
                shouldTeleport = true;
            }

            if (shouldTeleport) {
                // Force Teleport back to center
                player.teleport(SPAWN_POINT, { dimension: world.getDimension("overworld") });
                
                // If structure doesn't exist, they are just stuck in loop falling/tp'ing
                // User said: "if someone deletes it, other voided players will forever be stuck in a endless teleportation loop"
                // This logic fulfills that. If the blocks are gone, they TP to air, fall, TP to air...
            }
        }
    } catch (e) {
        console.warn(`Island Script Error: ${e}`);
    }
}, 20); // 1 second is fine - voided players cant escape
