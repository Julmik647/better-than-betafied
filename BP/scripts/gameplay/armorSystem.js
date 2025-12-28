import { world, system, EquipmentSlot } from '@minecraft/server';
console.warn("[keirazelle] Beta Armor System Loaded");

const CONFIG = Object.freeze({
    UI_TITLE_STAY: 40,
    BETA_DURABILITY_PENALTY: true,
    DEBUG: true
});

const BETA_STATS = Object.freeze({
    'minecraft:leather_helmet': 1,
    'minecraft:leather_chestplate': 3,
    'minecraft:leather_leggings': 2,
    'minecraft:leather_boots': 1,
    'minecraft:golden_helmet': 2,
    'minecraft:golden_chestplate': 5,
    'minecraft:golden_leggings': 3,
    'minecraft:golden_boots': 1,
    'minecraft:chainmail_helmet': 2,
    'minecraft:chainmail_chestplate': 5,
    'minecraft:chainmail_leggings': 4,
    'minecraft:chainmail_boots': 1,
    'minecraft:iron_helmet': 2,
    'minecraft:iron_chestplate': 6,
    'minecraft:iron_leggings': 5,
    'minecraft:iron_boots': 2,
    'minecraft:diamond_helmet': 3,
    'minecraft:diamond_chestplate': 8,
    'minecraft:diamond_leggings': 6,
    'minecraft:diamond_boots': 3
});

const IGNORE_ARMOR_SOURCES = Object.freeze(new Set([
    'fall', 'fire', 'lava', 'drowning', 'suffocation', 'void', 'starvation', 'magic', 'wither'
]));

class BetaArmorSystem {
    constructor() {
        system.runInterval(() => {
            system.runJob(this.updateUIGenerator());
        }, 60);

        world.afterEvents.entityHurt.subscribe((ev) => {
            this.onHurt(ev);
            if (ev.hurtEntity.typeId === 'minecraft:player') {
                this.updateSinglePlayer(ev.hurtEntity);
            }
        });
    }

    calculatePoints(player) {
        const equippable = player.getComponent('minecraft:equippable');
        if (!equippable) return 0;

        let totalPoints = 0;
        const slots = [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet];

        for (const slot of slots) {
            const item = equippable.getEquipment(slot);
            if (!item) continue;

            if (CONFIG.DEBUG) {
                console.log(`[ARMOR] Slot ${slot}: ${item.typeId}`);
            }

            if (!BETA_STATS[item.typeId]) continue;

            const basePoints = BETA_STATS[item.typeId];
            let factor = 1.0;

            if (CONFIG.BETA_DURABILITY_PENALTY) {
                const durability = item.getComponent('minecraft:durability');
                if (durability?.maxDurability > 0) {
                    factor = (durability.maxDurability - durability.damage) / durability.maxDurability;
                }
            }

            totalPoints += (basePoints * factor);
        }

        return totalPoints;
    }

    // generator for multi-player UI updates
    *updateUIGenerator() {
        const players = world.getPlayers();

        for (const player of players) {
            try {
                this.updateSinglePlayer(player);
            } catch (e) {
                console.error(`[ARMOR] Error: ${e}`);
            }
            yield;
        }
    }

    updateSinglePlayer(player) {
        const rawPoints = this.calculatePoints(player);

        const lastPoints = player.lastArmorPoints ?? -1;
        const lastUpdateTime = player.lastArmorUpdate ?? 0;
        const currentTime = system.currentTick;

        if (rawPoints !== lastPoints || (currentTime - lastUpdateTime) > 100) {
            let displayPoints = Math.round(rawPoints);

            if (rawPoints > 0 && displayPoints === 0) displayPoints = 1;

            const spriteId = displayPoints.toString().padStart(2, '0');
            const hudText = `_a${spriteId}`;

            player.onScreenDisplay.setTitle(hudText, {
                fadeInDuration: 0,
                fadeOutDuration: 0,
                stayDuration: 200
            });

            player.lastArmorPoints = rawPoints;
            player.lastArmorUpdate = currentTime;

            if (CONFIG.DEBUG && rawPoints !== lastPoints) {
                console.warn(`[ARMOR] Updated ${player.name} to ${hudText}`);
            }
        }
    }

    onHurt(event) {
        const { hurtEntity, damage, damageSource } = event;
        if (hurtEntity.typeId !== 'minecraft:player') return;

        if (IGNORE_ARMOR_SOURCES.has(damageSource.cause)) return;

        const betaPoints = Math.floor(this.calculatePoints(hurtEntity));

        const betaFactor = (25 - betaPoints) / 25;
        const targetDamage = damage * betaFactor;

        if (betaPoints < 5) {
            // chip damage placeholder
        }
    }
}

const betaArmor = new BetaArmorSystem();
export default betaArmor;