import json
import os

items_dir = r"C:\Users\DJ\Documents\BE 3.0\BP\items"
if not os.path.exists(items_dir):
    os.makedirs(items_dir)

# Beta 1.7.3 Food Data (Stack=1 usually)
foods = [
    {"id": "minecraft:apple", "nutrition": 4, "saturation": 2.4},
    {"id": "minecraft:bread", "nutrition": 5, "saturation": 6.0},
    {"id": "minecraft:porkchop", "nutrition": 3, "saturation": 1.8},
    {"id": "minecraft:cooked_porkchop", "nutrition": 8, "saturation": 12.8},
    {"id": "minecraft:cod", "nutrition": 2, "saturation": 0.4}, # "raw_fish"
    {"id": "minecraft:cooked_cod", "nutrition": 5, "saturation": 6.0}, # "cooked_fish"
    {"id": "minecraft:mushroom_stew", "nutrition": 10, "saturation": 12.0}, # Bowls returned? Handled by vanilla usually?
    {"id": "minecraft:golden_apple", "nutrition": 20, "saturation": 19.2} # Regens health
]

# Note: In Bedrock "cod" is raw fish.
# Also "golden_apple" in Beta healed 10 hearts directly! 
# Bedrock food component just does hunger.
# To heal health directly, we might need a "consume" event?
# But User's "Remove Effects" implies don't mess with effects.
# If I just set stack size, do I lose the "Heal" effect of Golden Apple?
# Vanilla Golden Apple has "on_consume" -> Effect Regen.
# I'll try to Preserve Vanilla behavior by NOT deleting the 'food' component completely if I can help it.
# But "minecraft:item" overrides replace completely.
# So I must redefine 'food'.

for f in foods:
    item_json = {
        "format_version": "1.20.50",
        "minecraft:item": {
            "description": {
                "identifier": f["id"],
                "menu_category": {
                    "category": "nature",
                    "group": "itemGroup.name.crops"
                }
            },
            "components": {
                "minecraft:max_stack_size": 1,
                "minecraft:food": {
                    "nutrition": f["nutrition"],
                    "saturation_modifier": "poor" if f["saturation"] < 2 else ("low" if f["saturation"] < 6 else "normal"), 
                    # Bedrock saturation is enum? "low", "normal", "good", "max", "supernatural"
                    # Or explicit float? Documentation says float works in some versions, strings in others.
                    # I'll use "saturation_modifier": f["saturation"] if possible?
                    # Docs say: "saturation_modifier": float or string.
                    # I'll use the 'saturation' value directly if I can, or approximation.
                    "can_always_eat": True if "apple" in f["id"] else False
                },
                "minecraft:use_animation": "eat",
                "minecraft:icon": {"texture": f["id"].replace("minecraft:", "")}
            }
        }
    }
    
    # Fix Texture Names
    tex = item_json["minecraft:item"]["components"]["minecraft:icon"]["texture"]
    if tex == "cod": tex = "fish_raw"
    if tex == "cooked_cod": tex = "fish_cooked"
    item_json["minecraft:item"]["components"]["minecraft:icon"]["texture"] = tex
    
    fname = f["id"].replace("minecraft:", "") + ".json"
    path = os.path.join(items_dir, fname)
    
    with open(path, 'w') as out:
        json.dump(item_json, out, indent=2)
        
print("Created unstackable food items.")
