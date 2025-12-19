import { world, system, ItemStack } from "@minecraft/server";
console.warn("[Betafied] Beta Loot Loaded");

// zombies drop feathers, remove rotten flesh

world.afterEvents.entityDie.subscribe((event) => {
    try {
        const { deadEntity } = event;
        const type = deadEntity.typeId;
        
        if (type === "minecraft:zombie" || type === "minecraft:zombie_villager" || type === "minecraft:husk") {
            // chance for feathers (0-2)
            const count = Math.floor(Math.random() * 3);
            if (count > 0) {
                deadEntity.dimension.spawnItem(new ItemStack("minecraft:feather", count), deadEntity.location);
            }
        }
    } catch (e) {}
});

// cleanup rotten flesh drops
world.afterEvents.entitySpawn.subscribe((event) => {
    try {
        const { entity } = event;
        if (entity.typeId === "minecraft:item") {
            const item = entity.getComponent("minecraft:item").itemStack;
            if (item.typeId === "minecraft:rotten_flesh") {
                entity.remove();
            }
        }
    } catch (e) {}
});
