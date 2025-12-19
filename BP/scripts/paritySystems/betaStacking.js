import { world, system, ItemStack } from "@minecraft/server";
console.warn("[Betafied] Beta Stacking Loaded");

// beta 1.7.3 stack limits
const CUSTOM_STACKS = {
    // unstackables (max 1)
    "minecraft:mushroom_stew": 1,
    "minecraft:bread": 1,
    "minecraft:porkchop": 1,
    "minecraft:cooked_porkchop": 1,
    "minecraft:cod": 1,
    "minecraft:cooked_cod": 1,
    "minecraft:beef": 1,
    "minecraft:cooked_beef": 1,
    "minecraft:chicken": 1,
    "minecraft:cooked_chicken": 1,
    "minecraft:mutton": 1,
    "minecraft:cooked_mutton": 1,
    "minecraft:rabbit": 1,
    "minecraft:cooked_rabbit": 1,
    "minecraft:salmon": 1,
    "minecraft:cooked_salmon": 1,
    "minecraft:apple": 1,
    "minecraft:golden_apple": 1,
    "minecraft:cake": 1,
    "minecraft:bed": 1,
    "minecraft:bucket": 1,
    "minecraft:water_bucket": 1,
    "minecraft:lava_bucket": 1,
    "minecraft:milk_bucket": 1,
    "minecraft:saddle": 1,
    "minecraft:oak_sign": 1,
    "minecraft:spruce_sign": 1,
    "minecraft:birch_sign": 1,
    // beta stacks
    "minecraft:snowball": 16,
    "minecraft:egg": 16,
    "minecraft:cookie": 8
};

console.warn("[Betafied] Beta Stacking Script Loaded");

// track players who just dropped items (cooldown)
const dropCooldowns = new Map();

// unstack items already in inventory
system.runInterval(() => {
    const now = system.currentTick;
    
    for (const player of world.getPlayers()) {
        try {
            // skip if on cooldown (just dropped items)
            const lastDrop = dropCooldowns.get(player.id) || 0;
            if (now - lastDrop < 20) continue;
            
            const inventory = player.getComponent("inventory");
            if (!inventory || !inventory.container) continue;
            
            const container = inventory.container;
            let didDrop = false;

            for (let i = 0; i < container.size; i++) {
                const item = container.getItem(i);
                if (!item) continue;

                const limit = CUSTOM_STACKS[item.typeId];
                
                if (limit !== undefined && item.amount > limit) {
                    const extraCount = item.amount - limit;
                    
                    // fix current slot to limit
                    container.setItem(i, new ItemStack(item.typeId, limit));

                    // fill empty slots with extras
                    let remaining = extraCount;
                    for (let j = 0; j < container.size && remaining > 0; j++) {
                        if (!container.getItem(j)) {
                            const countToAdd = Math.min(remaining, limit);
                            container.setItem(j, new ItemStack(item.typeId, countToAdd));
                            remaining -= countToAdd;
                        }
                    }
                    
                    // drop remaining on ground (one time, as single stack)
                    if (remaining > 0) {
                        const dropLoc = {
                            x: player.location.x + (Math.random() - 0.5) * 2,
                            y: player.location.y + 0.5,
                            z: player.location.z + (Math.random() - 0.5) * 2
                        };
                        player.dimension.spawnItem(
                            new ItemStack(item.typeId, remaining), 
                            dropLoc
                        );
                        didDrop = true;
                    }
                }
            }
            
            // set cooldown if we dropped items
            if (didDrop) {
                dropCooldowns.set(player.id, now);
            }
        } catch (e) {}
    }
}, 10);

// prevent picking up restricted items when no room
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        try {
            const inventory = player.getComponent("inventory");
            if (!inventory || !inventory.container) continue;
            
            const container = inventory.container;
            
            // count empty slots
            let emptySlots = 0;
            for (let i = 0; i < container.size; i++) {
                if (!container.getItem(i)) emptySlots++;
            }
            
            // if no empty slots, push away nearby restricted items
            if (emptySlots === 0) {
                const nearby = player.dimension.getEntities({
                    location: player.location,
                    maxDistance: 2,
                    type: "minecraft:item"
                });
                
                for (const itemEntity of nearby) {
                    try {
                        const itemComp = itemEntity.getComponent("item");
                        if (!itemComp || !itemComp.itemStack) continue;
                        
                        const typeId = itemComp.itemStack.typeId;
                        if (CUSTOM_STACKS[typeId] !== undefined) {
                            // push item away from player
                            const dx = itemEntity.location.x - player.location.x;
                            const dz = itemEntity.location.z - player.location.z;
                            const dist = Math.sqrt(dx*dx + dz*dz) || 1;
                            
                            itemEntity.applyImpulse({
                                x: (dx/dist) * 0.4,
                                y: 0.15,
                                z: (dz/dist) * 0.4
                            });
                        }
                    } catch (e) {}
                }
            }
        } catch (e) {}
    }
}, 3);

// cleanup on leave
world.afterEvents.playerLeave.subscribe((event) => {
    dropCooldowns.delete(event.playerId);
});
