// backup script to nuke non-beta mobs if json rules fail.

import { world } from "@minecraft/server";
console.warn("[Betafied] Mob Spawning Loaded");

// allowed mobs list
const ALLOWED_MOBS = new Set([
    "minecraft:item",
    "minecraft:minecart",
    "minecraft:chest_minecart",
    "minecraft:painting",
    "custom:furnace_minecart",
    "minecraft:boat",
    "minecraft:falling_block",
    "minecraft:arrow",
    "minecraft:chicken",
    "minecraft:cow",
    "minecraft:creeper",
    "minecraft:ghast",
    "minecraft:fireball",
    "minecraft:pig",
    "minecraft:tnt",
    "minecraft:player",
    "minecraft:sheep",
    "minecraft:skeleton",
    "minecraft:slime",
    "minecraft:spider",
    "minecraft:squid",
    "minecraft:wolf",
    "minecraft:zombie",
    "minecraft:zombie_pigman",
    "minecraft:lightning_bolt",
    "minecraft:snowball",
    "minecraft:egg",
    "minecraft:fishing_hook"
]);

// check spawns and remove unwanted entities
function handleEntitySpawn(event) {
    try {
        const { entity } = event;

        if (!entity || typeof entity.typeId !== "string") return;

        // remove if not in list
        if (!ALLOWED_MOBS.has(entity.typeId)) {
            entity.remove();
        }
    } catch (error) {
        // quiet error
    }
}

// listen
try {
    world.afterEvents.entitySpawn.subscribe(handleEntitySpawn);
} catch (e) {}