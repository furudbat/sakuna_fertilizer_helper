#! /usr/bin/python

import os
import yaml
import re
import io
import xlsxwriter 

def writeMaterials(itembook, material_sheet, materials):
    bold = itembook.add_format({'bold': 1})
    pos_buff = itembook.add_format({'bg_color': 'green', 'font_color': 'white'})
    neg_buff = itembook.add_format({'bg_color': 'red', 'font_color': 'white'})

    col = 0
    material_sheet.write(0, col, 'Name', bold)
    material_sheet.write(0, col + 1, 'Enemy Drop', bold)
    material_sheet.write(0, col + 2, 'Find In', bold)

    material_sheet.write(0, col + 3, 'Leaf Fertilizer', bold)
    material_sheet.write(0, col + 4, 'Kernel Fertilizer', bold)
    material_sheet.write(0, col + 5, 'Root Fertilizer', bold)

    material_sheet.write(0, col + 6, 'Yield/HP', bold)
    material_sheet.write(0, col + 7, 'Taste/Strength', bold)
    material_sheet.write(0, col + 8, 'Hardness/Vitality', bold)
    material_sheet.write(0, col + 9, 'Stickiness/Gusto', bold)
    material_sheet.write(0, col + 10, 'Aesthetic/Luck', bold)
    material_sheet.write(0, col + 11, 'aroma/Magic', bold)

    material_sheet.write(0, col + 12, 'Immunity', bold)
    material_sheet.write(0, col + 13, 'Pesticide', bold)
    material_sheet.write(0, col + 14, 'Herbicide', bold)

    material_sheet.write(0, col + 15, 'Toxicity', bold)

    material_sheet.write(0, col + 16, 'Description', bold)

    material_sheet.conditional_format('D1:O64', {'type': 'cell', 'criteria': '>', 'value': 0, 'format': pos_buff})
    material_sheet.conditional_format('D1:O64', {'type': 'cell', 'criteria': '<', 'value': 0, 'format': neg_buff})
    material_sheet.conditional_format('P1:P64', {'type': 'cell', 'criteria': '>', 'value': 0, 'format': neg_buff})
    material_sheet.conditional_format('P1:P64', {'type': 'cell', 'criteria': '<', 'value': 0, 'format': pos_buff})

    row = 1
    for material in materials:
        name = material['name']
        description = material['description'] if 'description' in material else ''

        enemy_drop_str = ''
        if 'enemy_drops' in material:
            for enemy_drop in material['enemy_drops']:
                time = "at {}".format(enemy_drop['time']) if enemy_drop['time'] != 'Always' else ''
                enemy_drop_str = enemy_drop_str + "{} {}\n".format(enemy_drop['name'], time)

        find_in_str = ''
        if 'find_in' in material:
            for find_in in material['find_in']:
                find_in_str = find_in_str + "{} ({})\n".format(find_in['name'], find_in['season'])


        leaf_fertilizer = material['fertilizer_bonus']['leaf_fertilizer'] if 'fertilizer_bonus' in material and 'leaf_fertilizer' in material['fertilizer_bonus'] else 0
        kernel_fertilizer = material['fertilizer_bonus']['kernel_fertilizer'] if 'fertilizer_bonus' in material and 'kernel_fertilizer' in material['fertilizer_bonus'] else 0
        root_fertilizer = material['fertilizer_bonus']['root_fertilizer'] if 'fertilizer_bonus' in material and 'root_fertilizer' in material['fertilizer_bonus'] else 0

        yield_hp = material['fertilizer_bonus']['yield_hp'] if 'fertilizer_bonus' in material and 'yield_hp' in material['fertilizer_bonus'] else 0
        taste_strength = material['fertilizer_bonus']['taste_strength'] if 'fertilizer_bonus' in material and 'taste_strength' in material['fertilizer_bonus'] else 0
        hardness_vitality = material['fertilizer_bonus']['hardness_vitality'] if 'fertilizer_bonus' in material and 'hardness_vitality' in material['fertilizer_bonus'] else 0
        stickiness_gusto = material['fertilizer_bonus']['stickiness_gusto'] if 'fertilizer_bonus' in material and 'stickiness_gusto' in material['fertilizer_bonus'] else 0
        aesthetic_luck = material['fertilizer_bonus']['aesthetic_luck'] if 'fertilizer_bonus' in material and 'aesthetic_luck' in material['fertilizer_bonus'] else 0
        aroma_magic = material['fertilizer_bonus']['aroma_magic'] if 'fertilizer_bonus' in material and 'aroma_magic' in material['fertilizer_bonus'] else 0

        immunity = material['fertilizer_bonus']['immunity'] if 'fertilizer_bonus' in material and 'immunity' in material['fertilizer_bonus'] else 0
        pesticide = material['fertilizer_bonus']['pesticide'] if 'fertilizer_bonus' in material and 'pesticide' in material['fertilizer_bonus'] else 0
        herbicide = material['fertilizer_bonus']['herbicide'] if 'fertilizer_bonus' in material and 'herbicide' in material['fertilizer_bonus'] else 0

        toxicity = material['fertilizer_bonus']['toxicity'] if 'fertilizer_bonus' in material and 'toxicity' in material['fertilizer_bonus'] else 0



        material_sheet.write_string(row, col, name) 
        material_sheet.write_string(row, col + 1, enemy_drop_str) 
        material_sheet.write_string(row, col + 2, find_in_str) 

        material_sheet.write_number(row, col + 3, leaf_fertilizer) 
        material_sheet.write_number(row, col + 4, kernel_fertilizer) 
        material_sheet.write_number(row, col + 5, root_fertilizer) 

        material_sheet.write_number(row, col + 6, yield_hp) 
        material_sheet.write_number(row, col + 7, taste_strength) 
        material_sheet.write_number(row, col + 8, hardness_vitality) 
        material_sheet.write_number(row, col + 9, stickiness_gusto) 
        material_sheet.write_number(row, col + 10, aesthetic_luck) 
        material_sheet.write_number(row, col + 11, aroma_magic) 

        material_sheet.write_number(row, col + 12, immunity) 
        material_sheet.write_number(row, col + 13, pesticide) 
        material_sheet.write_number(row, col + 14, herbicide) 

        material_sheet.write_number(row, col + 15, toxicity) 

        material_sheet.write_string(row, col + 16, description) 

        row += 1

def writeFood(itembook, food_sheet, foodarr):
    bold = itembook.add_format({'bold': 1})
    pos_buff = itembook.add_format({'bg_color': 'green', 'font_color': 'white'})
    neg_buff = itembook.add_format({'bg_color': 'red', 'font_color': 'white'})

    col = 0
    food_sheet.write(0, col, 'Name', bold)
    food_sheet.write(0, col + 1, 'Enemy Drop', bold)
    food_sheet.write(0, col + 2, 'Find In', bold)
    food_sheet.write(0, col + 3, 'Enchant', bold)
    food_sheet.write(0, col + 4, 'Ingredients', bold)
    food_sheet.write(0, col + 5, 'When Spoiled', bold)

    food_sheet.write(0, col + 6, 'HP', bold)
    food_sheet.write(0, col + 7, 'SP', bold)
    food_sheet.write(0, col + 8, 'Strength', bold)
    food_sheet.write(0, col + 9, 'Vitality', bold)
    food_sheet.write(0, col + 10, 'Magic', bold)
    food_sheet.write(0, col + 11, 'Luck', bold)
    food_sheet.write(0, col + 12, 'Fullness', bold)

    food_sheet.write(0, col + 13, 'Leaf Fertilizer', bold)
    food_sheet.write(0, col + 14, 'Kernel Fertilizer', bold)
    food_sheet.write(0, col + 15, 'Root Fertilizer', bold)

    food_sheet.write(0, col + 16, 'Yield/HP', bold)
    food_sheet.write(0, col + 17, 'Taste/Strength', bold)
    food_sheet.write(0, col + 18, 'Hardness/Vitality', bold)
    food_sheet.write(0, col + 19, 'Stickiness/Gusto', bold)
    food_sheet.write(0, col + 20, 'Aesthetic/Luck', bold)
    food_sheet.write(0, col + 21, 'aroma/Magic', bold)

    food_sheet.write(0, col + 22, 'Immunity', bold)
    food_sheet.write(0, col + 23, 'Pesticide', bold)
    food_sheet.write(0, col + 24, 'Herbicide', bold)

    food_sheet.write(0, col + 25, 'Toxicity', bold)

    food_sheet.write(0, col + 26, 'Life/Expire in (days)', bold)
    food_sheet.write(0, col + 27, 'Price', bold)
    food_sheet.write(0, col + 28, 'Description', bold)

    food_sheet.conditional_format('G1:M180', {'type': 'cell', 'criteria': '>', 'value': 0, 'format': pos_buff})
    food_sheet.conditional_format('G1:M180', {'type': 'cell', 'criteria': '<', 'value': 0, 'format': neg_buff})
    food_sheet.conditional_format('N1:Y180', {'type': 'cell', 'criteria': '>', 'value': 0, 'format': pos_buff})
    food_sheet.conditional_format('N1:Y180', {'type': 'cell', 'criteria': '<', 'value': 0, 'format': neg_buff})
    food_sheet.conditional_format('Z1:Z180', {'type': 'cell', 'criteria': '>', 'value': 0, 'format': neg_buff})
    food_sheet.conditional_format('Z1:Z180', {'type': 'cell', 'criteria': '<', 'value': 0, 'format': pos_buff})

    row = 1
    for food in foodarr:
        name = food['name']
        description = food['description'] if 'description' in food else ''
        when_spoiled = food['when_spoiled'] if 'when_spoiled' in food else ''
        life = food['life'] if 'life' in food else 0
        price = food['price'] if 'price' in food else 0

        enemy_drop_str = ''
        if 'enemy_drops' in food:
            for enemy_drop in food['enemy_drops']:
                enemy_drop_str = enemy_drop_str + "{} at {}\n".format(enemy_drop['name'], enemy_drop['time'])

        find_in_str = ''
        if 'find_in' in food:
            for find_in in food['find_in']:
                find_in_str = find_in_str + "{} ({})\n".format(find_in['name'], find_in['season'])

        enchants_str = ''
        if 'food_bonus' in food and 'enchant' in food['food_bonus']:
            for enchant in food['food_bonus']['enchant']:
                enchants_str = enchants_str + " * {} {}\n".format(enchant['name'], enchant['level'])

        ingredients_str = ''
        if 'ingredients' in food:
            for ingredient in food['ingredients']:
                ingredients_str = ingredients_str + "{}x {} {} ".format(ingredient['amount'], ingredient['name'], ingredient['operator'])
                if ingredient['operator'] == 'and' or ingredient['operator'] == '':
                    ingredients_str = ingredients_str + "\n"


        hp = food['food_bonus']['hp'] if 'food_bonus' in food and 'hp' in food['food_bonus'] else 0
        sp = food['food_bonus']['sp'] if 'food_bonus' in food and 'sp' in food['food_bonus'] else 0
        strength = food['food_bonus']['strength'] if 'food_bonus' in food and 'strength' in food['food_bonus'] else 0
        vitality = food['food_bonus']['vitality'] if 'food_bonus' in food and 'vitality' in food['food_bonus'] else 0
        magic = food['food_bonus']['magic'] if 'food_bonus' in food and 'magic' in food['food_bonus'] else 0
        luck = food['food_bonus']['luck'] if 'food_bonus' in food and 'luck' in food['food_bonus'] else 0
        fullness = food['food_bonus']['fullness'] if 'food_bonus' in food and 'fullness' in food['food_bonus'] else 0


        leaf_fertilizer = food['fertilizer_bonus']['leaf_fertilizer'] if 'fertilizer_bonus' in food and 'leaf_fertilizer' in food['fertilizer_bonus'] else 0
        kernel_fertilizer = food['fertilizer_bonus']['kernel_fertilizer'] if 'fertilizer_bonus' in food and 'kernel_fertilizer' in food['fertilizer_bonus'] else 0
        root_fertilizer = food['fertilizer_bonus']['root_fertilizer'] if 'fertilizer_bonus' in food and 'root_fertilizer' in food['fertilizer_bonus'] else 0

        yield_hp = food['fertilizer_bonus']['yield_hp'] if 'fertilizer_bonus' in food and 'yield_hp' in food['fertilizer_bonus'] else 0
        taste_strength = food['fertilizer_bonus']['taste_strength'] if 'fertilizer_bonus' in food and 'taste_strength' in food['fertilizer_bonus'] else 0
        hardness_vitality = food['fertilizer_bonus']['hardness_vitality'] if 'fertilizer_bonus' in food and 'hardness_vitality' in food['fertilizer_bonus'] else 0
        stickiness_gusto = food['fertilizer_bonus']['stickiness_gusto'] if 'fertilizer_bonus' in food and 'stickiness_gusto' in food['fertilizer_bonus'] else 0
        aesthetic_luck = food['fertilizer_bonus']['aesthetic_luck'] if 'fertilizer_bonus' in food and 'aesthetic_luck' in food['fertilizer_bonus'] else 0
        aroma_magic = food['fertilizer_bonus']['aroma_magic'] if 'fertilizer_bonus' in food and 'aroma_magic' in food['fertilizer_bonus'] else 0

        immunity = food['fertilizer_bonus']['immunity'] if 'fertilizer_bonus' in food and 'immunity' in food['fertilizer_bonus'] else 0
        pesticide = food['fertilizer_bonus']['pesticide'] if 'fertilizer_bonus' in food and 'pesticide' in food['fertilizer_bonus'] else 0
        herbicide = food['fertilizer_bonus']['herbicide'] if 'fertilizer_bonus' in food and 'herbicide' in food['fertilizer_bonus'] else 0

        toxicity = food['fertilizer_bonus']['toxicity'] if 'fertilizer_bonus' in food and 'toxicity' in food['fertilizer_bonus'] else 0



        food_sheet.write_string(row, col, name) 
        food_sheet.write_string(row, col + 1, enemy_drop_str) 
        food_sheet.write_string(row, col + 2, find_in_str) 
        food_sheet.write_string(row, col + 3, enchants_str) 
        food_sheet.write_string(row, col + 4, ingredients_str) 
        food_sheet.write_string(row, col + 5, when_spoiled) 


        food_sheet.write_number(row, col + 6, hp) 
        food_sheet.write_number(row, col + 7, sp) 
        food_sheet.write_number(row, col + 8, strength) 
        food_sheet.write_number(row, col + 9, vitality) 
        food_sheet.write_number(row, col + 10, magic) 
        food_sheet.write_number(row, col + 11, luck) 
        food_sheet.write_number(row, col + 12, fullness) 


        food_sheet.write_number(row, col + 13, leaf_fertilizer) 
        food_sheet.write_number(row, col + 14, kernel_fertilizer) 
        food_sheet.write_number(row, col + 15, root_fertilizer) 

        food_sheet.write_number(row, col + 16, yield_hp) 
        food_sheet.write_number(row, col + 17, taste_strength) 
        food_sheet.write_number(row, col + 18, hardness_vitality) 
        food_sheet.write_number(row, col + 19, stickiness_gusto) 
        food_sheet.write_number(row, col + 20, aesthetic_luck) 
        food_sheet.write_number(row, col + 21, aroma_magic) 

        food_sheet.write_number(row, col + 22, immunity) 
        food_sheet.write_number(row, col + 23, pesticide) 
        food_sheet.write_number(row, col + 24, herbicide) 

        food_sheet.write_number(row, col + 25, toxicity) 


        food_sheet.write_number(row, col + 26, life) 
        food_sheet.write_number(row, col + 27, price) 
        food_sheet.write_string(row, col + 28, description) 

        row += 1

def writeCooking(itembook, cooking_sheet, cooking):
    bold = itembook.add_format({'bold': 1})
    pos_buff = itembook.add_format({'bg_color': 'green', 'font_color': 'white'})
    neg_buff = itembook.add_format({'bg_color': 'red', 'font_color': 'white'})

    col = 0
    cooking_sheet.write(0, col, 'Name', bold)
    cooking_sheet.write(0, col + 1, 'Seasonal Buff', bold)
    cooking_sheet.write(0, col + 2, 'Enchant', bold)
    cooking_sheet.write(0, col + 3, 'Seasonal Enchant', bold)
    cooking_sheet.write(0, col + 4, 'Ingredients', bold)

    cooking_sheet.write(0, col + 5, 'HP', bold)
    cooking_sheet.write(0, col + 6, 'SP', bold)
    cooking_sheet.write(0, col + 7, 'Strength', bold)
    cooking_sheet.write(0, col + 8, 'Vitality', bold)
    cooking_sheet.write(0, col + 9, 'Magic', bold)
    cooking_sheet.write(0, col + 10, 'Luck', bold)
    cooking_sheet.write(0, col + 11, 'Fullness', bold)

    cooking_sheet.write(0, col + 12, 'Seasonal HP', bold)
    cooking_sheet.write(0, col + 13, 'Seasonal SP', bold)
    cooking_sheet.write(0, col + 14, 'Seasonal Strength', bold)
    cooking_sheet.write(0, col + 15, 'Seasonal Vitality', bold)
    cooking_sheet.write(0, col + 16, 'Seasonal Magic', bold)
    cooking_sheet.write(0, col + 17, 'Seasonal Luck', bold)
    cooking_sheet.write(0, col + 18, 'Seasonal Fullness', bold)

    cooking_sheet.write(0, col + 19, 'Description', bold)

    cooking_sheet.conditional_format('E1:K560', {'type': 'cell', 'criteria': '>', 'value': 0, 'format': pos_buff})
    cooking_sheet.conditional_format('E1:K560', {'type': 'cell', 'criteria': '<', 'value': 0, 'format': neg_buff})
    cooking_sheet.conditional_format('L1:R560', {'type': 'cell', 'criteria': '>', 'value': 0, 'format': pos_buff})
    cooking_sheet.conditional_format('L1:R560', {'type': 'cell', 'criteria': '<', 'value': 0, 'format': neg_buff})

    row = 1
    for dish in cooking:
        name = dish['name']
        description = dish['description'] if 'description' in dish else ''
        season_buff = dish['season_buff'] if 'season_buff' in dish else ''

        enchants_str = ''
        if 'food_bonus' in dish and 'enchant' in dish['food_bonus']:
            for enchant in dish['food_bonus']['enchant']:
                enchants_str = enchants_str + " * {} {}\n".format(enchant['name'], enchant['level'])

        seasonal_enchants_str = ''
        if 'season_food_bonus' in dish and 'enchant' in dish['season_food_bonus']:
            for enchant in dish['season_food_bonus']['enchant']:
                seasonal_enchants_str = seasonal_enchants_str + " * {} {}\n".format(enchant['name'], enchant['level'])

        ingredients_str = ''
        if 'main_ingredients' in dish:
            for ingredient in dish['main_ingredients']:
                ingredients_str = ingredients_str + "{}x {} {} ".format(ingredient['amount'], ingredient['name'], ingredient['operator'])
                if ingredient['operator'] == 'and' or ingredient['operator'] == '':
                    ingredients_str = ingredients_str + "\n"
        if 'ingredients' in dish:
            for ingredient in dish['ingredients']:
                ingredients_str = ingredients_str + "{}x {} {} ".format(ingredient['amount'], ingredient['name'], ingredient['operator'])
                if ingredient['operator'] == 'and' or ingredient['operator'] == '':
                    ingredients_str = ingredients_str + "\n"


        hp = dish['food_bonus']['hp'] if 'food_bonus' in dish and 'hp' in dish['food_bonus'] else 0
        sp = dish['food_bonus']['sp'] if 'food_bonus' in dish and 'sp' in dish['food_bonus'] else 0
        strength = dish['food_bonus']['strength'] if 'food_bonus' in dish and 'strength' in dish['food_bonus'] else 0
        vitality = dish['food_bonus']['vitality'] if 'food_bonus' in dish and 'vitality' in dish['food_bonus'] else 0
        magic = dish['food_bonus']['magic'] if 'food_bonus' in dish and 'magic' in dish['food_bonus'] else 0
        luck = dish['food_bonus']['luck'] if 'food_bonus' in dish and 'luck' in dish['food_bonus'] else 0
        fullness = dish['food_bonus']['fullness'] if 'food_bonus' in dish and 'fullness' in dish['food_bonus'] else 0

        seasonal_hp = dish['season_food_bonus']['hp'] if 'season_food_bonus' in dish and 'hp' in dish['season_food_bonus'] else 0
        seasonal_sp = dish['season_food_bonus']['sp'] if 'season_food_bonus' in dish and 'sp' in dish['season_food_bonus'] else 0
        seasonal_strength = dish['season_food_bonus']['strength'] if 'season_food_bonus' in dish and 'strength' in dish['season_food_bonus'] else 0
        seasonal_vitality = dish['season_food_bonus']['vitality'] if 'season_food_bonus' in dish and 'vitality' in dish['season_food_bonus'] else 0
        seasonal_magic = dish['season_food_bonus']['magic'] if 'season_food_bonus' in dish and 'magic' in dish['season_food_bonus'] else 0
        seasonal_luck = dish['season_food_bonus']['luck'] if 'season_food_bonus' in dish and 'luck' in dish['season_food_bonus'] else 0
        seasonal_fullness = dish['season_food_bonus']['fullness'] if 'season_food_bonus' in dish and 'fullness' in dish['season_food_bonus'] else 0


        cooking_sheet.write_string(row, col, name) 
        cooking_sheet.write_string(row, col + 1, season_buff) 
        cooking_sheet.write_string(row, col + 2, enchants_str) 
        cooking_sheet.write_string(row, col + 3, seasonal_enchants_str) 
        cooking_sheet.write_string(row, col + 4, ingredients_str) 


        cooking_sheet.write_number(row, col + 5, hp) 
        cooking_sheet.write_number(row, col + 6, sp) 
        cooking_sheet.write_number(row, col + 7, strength) 
        cooking_sheet.write_number(row, col + 8, vitality) 
        cooking_sheet.write_number(row, col + 9, magic) 
        cooking_sheet.write_number(row, col + 10, luck) 
        cooking_sheet.write_number(row, col + 11, fullness) 

        cooking_sheet.write_number(row, col + 12, seasonal_hp) 
        cooking_sheet.write_number(row, col + 13, seasonal_sp) 
        cooking_sheet.write_number(row, col + 14, seasonal_strength) 
        cooking_sheet.write_number(row, col + 15, seasonal_vitality) 
        cooking_sheet.write_number(row, col + 16, seasonal_magic) 
        cooking_sheet.write_number(row, col + 17, seasonal_luck) 
        cooking_sheet.write_number(row, col + 18, seasonal_fullness) 

        cooking_sheet.write_string(row, col + 19, description) 

        row += 1

def main():

    with open(r'./materials.yml') as f:
        materials = yaml.load(f, Loader=yaml.FullLoader)
    with open(r'./food.yml') as f:
        food = yaml.load(f, Loader=yaml.FullLoader)
    with open(r'./cooking.yml') as f:
        cooking = yaml.load(f, Loader=yaml.FullLoader)

    itembook = xlsxwriter.Workbook('Item-List.xlsx')
    material_sheet = itembook.add_worksheet("Materials")
    food_sheet = itembook.add_worksheet("Food")
    cooking_sheet = itembook.add_worksheet("Cooking")

    writeMaterials(itembook, material_sheet, materials)
    writeFood(itembook, food_sheet, food)
    writeCooking(itembook, cooking_sheet, cooking)

    itembook.close()

if __name__ == "__main__":
    main()
