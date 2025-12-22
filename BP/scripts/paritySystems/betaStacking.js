import { world, system, ItemStack } from "@minecraft/server";

console.warn("[Betafied] Beta Stacking System Loaded");

const UNSTACKABLES = new Set([
    "minecraft:apple",
    "minecraft:bread",
    "minecraft:porkchop",
    "minecraft:cooked_porkchop",
    "minecraft:cod",
    "minecraft:cooked_cod",
    "minecraft:mushroom_stew",
    "minecraft:golden_apple",
    "minecraft:cake",
    "minecraft:saddle",
    "minecraft:bucket",
    "minecraft:water_bucket",
    "minecraft:lava_bucket",
    "minecraft:milk_bucket",
    // eggs and snowballs stack to 16 in beta 1.7.3, so excluded here
    "minecraft:bed",
    "minecraft:oak_sign",
    "minecraft:wooden_door",
    "minecraft:iron_door"
]);

// cookies stack to 8
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        enforceStacking(player);
    }
}, 10);

function enforceStacking(player) {
    const inv = player.getComponent("inventory")?.container;
    if (!inv) return;

    for (let i = 0; i < inv.size; i++) {
        const item = inv.getItem(i);
        if (!item) continue;

        // unstackables (limit 1)
        if (UNSTACKABLES.has(item.typeId)) {
            if (item.amount > 1) {
                const excess = item.amount - 1;
                item.amount = 1;
                inv.setItem(i, item);
                spillItems(player, inv, item.typeId, excess);
            }
        }
        
        // cookies (limit 8)
        else if (item.typeId === "minecraft:cookie") {
            if (item.amount > 8) {
                const excess = item.amount - 8;
                item.amount = 8;
                inv.setItem(i, item);
                spillItems(player, inv, item.typeId, excess);
            }
        }
    }
}

function spillItems(player, inv, typeId, amount) {
    // try to fill other empty slots first
    const oneStack = new ItemStack(typeId, 1);
    
    for (let k = 0; k < amount; k++) {
        const left = inv.addItem(oneStack);
        if (left) {
            // inventory full, drop at feet
            player.dimension.spawnItem(oneStack, player.location);
        }
    }
}
