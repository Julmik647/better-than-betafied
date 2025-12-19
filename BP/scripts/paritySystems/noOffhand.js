import { world, system, EquipmentSlot } from "@minecraft/server";
console.warn("[Betafied] No Offhand Loaded");

// offhand didnt exist in beta - clear it periodically
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        try {
            const equippable = player.getComponent("minecraft:equippable");
            if (equippable?.getEquipment(EquipmentSlot.Offhand)) {
                equippable.setEquipment(EquipmentSlot.Offhand, undefined);
            }
        } catch {}
    }
}, 10); // 0.5s is plenty fast - items cant be used before next check

