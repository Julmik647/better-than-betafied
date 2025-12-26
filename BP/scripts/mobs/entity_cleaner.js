import { world, system } from "@minecraft/server";

console.warn("[keirazelle] Entity Cleaner Module Loaded");

// ban list 
const BANNED_MOBS = new Set([
    // villagers & illagers
    "minecraft:villager",
    "minecraft:villager_v2",
    "minecraft:zombie_villager",
    "minecraft:zombie_villager_v2",
    "minecraft:wandering_trader",
    "minecraft:iron_golem",
    "minecraft:snow_golem",
    "minecraft:pillager",
    "minecraft:vindicator",
    "minecraft:evoker",
    "minecraft:ravager",
    "minecraft:vex",
    "minecraft:witch",
    "minecraft:illusioner",

    // modern monsters
    "minecraft:drowned",       
    "minecraft:husk",           
    "minecraft:stray",          
    "minecraft:phantom",        
    "minecraft:enderman",       
    "minecraft:cave_spider",  
    "minecraft:silverfish",     
    "minecraft:guardian",
    "minecraft:elder_guardian",
    "minecraft:wither_skeleton",
    "minecraft:wither",
    "minecraft:shulker",
    "minecraft:endermite",
    "minecraft:breeze",
    "minecraft:bogged",
    "minecraft:warden",

    // other mobs:p
    "minecraft:horse",
    "minecraft:donkey",
    "minecraft:mule",
    "minecraft:skeleton_horse",
    "minecraft:zombie_horse",
    "minecraft:llama",
    "minecraft:trader_llama",
    "minecraft:ocelot",
    "minecraft:cat",
    "minecraft:parrot",
    "minecraft:bat",
    "minecraft:polar_bear",
    "minecraft:panda",
    "minecraft:fox",
    "minecraft:bee",
    "minecraft:goat",
    "minecraft:axolotl",
    "minecraft:glow_squid",
    "minecraft:frog",
    "minecraft:tadpole",
    "minecraft:allay",
    "minecraft:sniffer",
    "minecraft:camel",
    "minecraft:armadillo",
    "minecraft:rabbit",
    "minecraft:turtle",
    "minecraft:dolphin",

    // nether update mobs 
    "minecraft:piglin",
    "minecraft:piglin_brute",
    "minecraft:hoglin",
    "minecraft:zoglin",
    "minecraft:strider",
    "minecraft:magma_cube"
]);

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        try {
            const dim = player.dimension;
            const entities = dim.getEntities({ location: player.location, maxDistance: 32 });
            
            for (const ent of entities) {
                // fast lookup
                if (BANNED_MOBS.has(ent.typeId)) {
                    ent.remove();
                }
            }
        } catch (e) {}
    }
}, 100); // 5 seconds is fine for lazy cleaning
