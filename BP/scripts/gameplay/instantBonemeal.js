import { world, system } from "@minecraft/server";
console.warn("[keirazelle] Instant Bonemeal Loaded");

// instant growth for crops

world.beforeEvents.itemUseOn.subscribe((event) => {
    try {
        const { itemStack, block } = event;
        
        if (itemStack.typeId === "minecraft:bone_meal") {
            // wheat only for now, can add others
            if (block.typeId === "minecraft:wheat") {
                system.run(() => {
                    // set to max age (7)
                    block.setPermutation(block.permutation.withState("growth", 7));
                    block.dimension.spawnParticle("minecraft:crop_growth_emitter", block.center());
                });
            }
        }
    } catch (e) {}
});
