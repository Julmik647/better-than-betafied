import { world, system } from "@minecraft/server";
console.warn("[keirazelle] Instant Bonemeal Loaded");

world.beforeEvents.itemUseOn.subscribe((event) => {
    try {
        const { itemStack, block } = event;

        if (itemStack.typeId === "minecraft:bone_meal") {
            if (block.typeId === "minecraft:wheat") {
                system.run(() => {
                    block.setPermutation(block.permutation.withState("growth", 7));
                    block.dimension.spawnParticle("minecraft:crop_growth_emitter", block.center());
                });
            }
        }
    } catch (e) {
        console.warn(`[instantBonemeal] error: ${e}`);
    }
});
