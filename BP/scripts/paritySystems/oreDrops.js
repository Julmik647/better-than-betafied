import { world, ItemStack } from "@minecraft/server";
console.warn("[Betafied] Ore Drops Loaded");

// ore drops - replace raw items with ore blocks (beta parity)
console.warn("[Betafied] Ore Drops Script Loaded");

const ORE_REPLACEMENTS = {
    "minecraft:raw_iron": "minecraft:iron_ore",
    "minecraft:raw_gold": "minecraft:gold_ore",
    "minecraft:raw_copper": "minecraft:iron_ore"
};

world.afterEvents.entitySpawn.subscribe((event) => {
    try {
        const entity = event.entity;
        if (entity.typeId !== "minecraft:item") return;
        
        const itemComp = entity.getComponent("item");
        if (!itemComp) return;
        
        const item = itemComp.itemStack;
        if (!item) return;
        
        const replacement = ORE_REPLACEMENTS[item.typeId];
        if (replacement) {
            const loc = entity.location;
            const dim = entity.dimension;
            entity.remove();
            
            // spawn the ore block as item
            dim.spawnItem(new ItemStack(replacement, item.amount), loc);
        }
    } catch (e) {}
});
