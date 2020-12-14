#! /usr/bin/python

import os
import json
import yaml
import re
import io
from csv import DictReader
from pprint import pprint

insects = [
    'Grasshopper'
]

meats = [
    'Rabbit Meat',
    'Pork',
    'Boar Meat',
    'Venison',
    'Bear Meat',
    'Badger Meat',
    'Turtle Meat',
    'Sparrow Meat',
    'Pheasant Meat',
    'Duck Meat'
]
vegetables = [
    'Potato',
    'Persimmon',
    'Chestnut',
    'Cucumber',
    'Mushroom',
    'Mugwort',
    'Root Corps',
    'Acorn',
    'Taro',
    'Onion',
    'Seven Herbs',
    'Horsetail',
    'Ginko Nut',
    'Maize'
]
seafood = [
    'Crucain Carp',
    'Sweetfish',
    'Smelt',
    'Basket Clam',
    'Carp',
    'Char',
    'Eel',
    'Masu Salmon',
    'Loach',
    'Salmon'
]
grains = [
    'White Rice',
    'Brown Rice',
    'Mixed Rice',
    'Bean Rice',
    'Foxtail Millet',
    'Buckwheat'
]
materials = [
    'Salt',
    'Sugar',
    'Tea',
    'Fish Mint'
    'Sesame',
    'Kombu Kelp',
    'Oil',
    'Fish Oil',
    'Vinegar',
    'Rice Bran',
    'Spring Water',
    'Renowed Water',
    'Medicinal Base'
]

meat_seafood = meats
meat_seafood.extend(seafood)


def newItem(name, category):
    return {
        'name': name,
        'category': category,
        'fertilizer_bonus': {},
        'food_bonus': {},
        'found_in': [],
        'source': [],
        'time_of_day': '',
        'used_in_recipes': []
    }

def setFertilizerBonus(item, row):
    if row['Mnr_Ne'].isnumeric() and int(row['Mnr_Ne']) != 0:
        item['fertilizer_bonus']['root_fertilizer'] = int(row['Mnr_Ne'])
    if row['Mnr_Ho'].isnumeric() and int(row['Mnr_Ho']) != 0:
        item['fertilizer_bonus']['kernel_fertilizer'] = int(row['Mnr_Ho'])
    if row['Mnr_Ha'].isnumeric() and int(row['Mnr_Ha']) != 0:
        item['fertilizer_bonus']['leaf_fertilizer'] = int(row['Mnr_Ha'])

    if row['Mnr_Yield'].isnumeric() and int(row['Mnr_Yield']) != 0:
        item['fertilizer_bonus']['yield_hp'] = int(row['Mnr_Yield'])
    if row['Mnr_Taste'].isnumeric() and int(row['Mnr_Taste']) != 0:
        item['fertilizer_bonus']['taste_strength'] = int(row['Mnr_Taste'])
    if row['Mnr_Hardness'].isnumeric() and int(row['Mnr_Hardness']) != 0:
        item['fertilizer_bonus']['hardness_vitality'] = int(
            row['Mnr_Hardness'])
    if row['Mnr_Viscose'].isnumeric() and int(row['Mnr_Viscose']) != 0:
        item['fertilizer_bonus']['stickiness_gusto'] = int(row['Mnr_Viscose'])
    if row['Mnr_Appearance'].isnumeric() and int(row['Mnr_Appearance']) != 0:
        item['fertilizer_bonus']['aesthetic_luck'] = int(row['Mnr_Appearance'])
    if row['Mnr_Fragrance'].isnumeric() and int(row['Mnr_Fragrance']) != 0:
        item['fertilizer_bonus']['armor_magic'] = int(row['Mnr_Fragrance'])

    if row['Mnr_Immunity'].isnumeric() and int(row['Mnr_Immunity']) != 0:
        item['fertilizer_bonus']['immunity'] = int(row['Mnr_Immunity'])
    if row['Mnr_Herbicide'].isnumeric() and int(row['Mnr_Herbicide']) != 0:
        item['fertilizer_bonus']['herbicide'] = int(row['Mnr_Herbicide'])
    if row['Mnr_Pesticide'].isnumeric() and int(row['Mnr_Pesticide']) != 0:
        item['fertilizer_bonus']['pesticide'] = int(row['Mnr_Pesticide'])

    if row['Mnr_Toxic'].isnumeric() and int(row['Mnr_Toxic']) != 0:
        item['fertilizer_bonus']['toxicity'] = int(row['Mnr_Toxic'])

    return item


def parseEnchant(enchant, enchants_map):
    ret = []
    for en in enchant.split('|'):
        en = en.strip()
        enchant_level = int(re.findall(r'^[\*a-zA-Z_]+\/(\d+)$', en)[0]) + 1 if re.findall(r'^[\*a-zA-Z_]+\/(\d+)$', en) and re.findall(r'^[a-zA-Z_]+\/(\d+)$', en)[0].isnumeric() else 1
        enchant_code = re.findall(r'^([\*a-zA-Z_]+)\/\d+$', en)[0] if re.findall(r'^([\*a-zA-Z_]+)\/\d+$', en) else ''
        enchant_name = [it for it in enchants_map.values() if it['Code'] == enchant_code][0]['name'] if [it for it in enchants_map.values() if it['Code'] == enchant_code] else ''

        if enchant_name:
            ret.append({ "name": enchant_name, "level": enchant_level })

    return ret


def parseSource(item, sourcestr, items_map, item_names, delimiter='|', auto=None):
    ret = []
    if delimiter in sourcestr:
        for source in sourcestr.split(delimiter):
            source = source.strip()

            amount = int(re.findall(r'^[\*a-zA-Z_]+\/(\d+)$', source)[0]) + 1 if re.findall(r'^[\*a-zA-Z_]+\/(\d+)$', source) and re.findall(r'^[\*a-zA-Z_]+\/(\d+)$', source)[0].isnumeric() else 1
            
            item_code = re.findall(r'^([\*a-zA-Z_]+)\/\d+$', source)[0] if re.findall(r'^([\*a-zA-Z_]+)\/\d+$', source) else ''

            if item['name'] == 'Miso':
                print(item_code)

            if re.findall(r'^Flag_(\s+)$', item_code):
                food_flag = re.findall(r'^Flag_(\s+)$', item_code)[0] if re.findall(r'^Flag_(\s+)$', item_code) else ''
                for food_item in [it for it in items_map.values() if it['sub_category'] == food_flag]:
                    item_name = food_item['name']
                    if item_name:
                        ret.append({"name": item_name, "amount": amount})
            elif re.findall(r'^\*Auto$', item_code):
                if auto:
                    ret.append({"name": auto, "amount": amount})
                else:
                    print("warn: auto is None but '*Auto' was found in {}".format(sourcestr))
            elif item_code == 'Meat':
                for item_name in meats:
                    if item_name:
                        ret.append({"name": item_name, "amount": amount})
            elif item_code == 'Vegetable':
                for item_name in vegetables:
                    if item_name:
                        ret.append({"name": item_name, "amount": amount})
            elif item_code == 'Seafood':
                for item_name in seafood:
                    if item_name:
                        ret.append({"name": item_name, "amount": amount})
            elif item_code == 'Grain':
                for item_name in grains:
                    if item_name:
                        ret.append({"name": item_name, "amount": amount})
            elif item_code == 'Insect':
                for item_name in insects:
                    if item_name:
                        ret.append({"name": item_name, "amount": amount})
            else:
                item_name = [it for it in item_names if it['Code'] == item_code][0]['name'] if [it for it in item_names if it['Code'] == item_code] else ''

                if item_name:
                    ret.append({"name": item_name, "amount": amount})

    return ret

def setFoodBonus(item, row, enchants_map):
    if row['BuffHpMax'].isnumeric() and int(row['BuffHpMax']) != 0:
        item['food_bonus']['hp'] = int(row['BuffHpMax'])
    if row['BuffWpMax'].isnumeric() and int(row['BuffWpMax']) != 0:
        item['food_bonus']['sp'] = int(row['BuffWpMax'])
    if row['BuffStrength'].isnumeric() and int(row['BuffStrength']) != 0:
        item['food_bonus']['strength'] = int(row['BuffStrength'])
    if row['BuffVital'].isnumeric() and int(row['BuffVital']) != 0:
        item['food_bonus']['vitality'] = int(row['BuffVital'])
    if row['BuffMagic'].isnumeric() and int(row['BuffMagic']) != 0:
        item['food_bonus']['magic'] = int(row['BuffMagic'])
    if row['BuffLuck'].isnumeric() and int(row['BuffLuck']) != 0:
        item['food_bonus']['luck'] = int(row['BuffLuck'])
    if row['BuffHungry'].isnumeric() and int(row['BuffHungry']) != 0:
        item['food_bonus']['fullness'] = int(row['BuffHungry'])
    
    if row['BuffEnchant'] and row['BuffEnchant'] != '-':
        item['food_bonus']['enchant'] = parseEnchant(row['BuffEnchant'], enchants_map)

    return item

def setFoodBonusFromCooking(item, row, enchants_map):
    if row['SeasonBuff'] and row['SeasonBuff'] != '-':
        item['season_buff'] = row['SeasonBuff']
        item['season_bonus'] = {}

        if row['SeasonBuffHpMax'].isnumeric() and int(row['SeasonBuffHpMax']) != 0:
            item['season_bonus']['hp'] = int(row['SeasonBuffHpMax'])
        if row['SeasonBuffWpMax'].isnumeric() and int(row['SeasonBuffWpMax']) != 0:
            item['season_bonus']['sp'] = int(row['SeasonBuffWpMax'])
        if row['SeasonBuffStrength'].isnumeric() and int(row['SeasonBuffStrength']) != 0:
            item['season_bonus']['strength'] = int(row['SeasonBuffStrength'])
        if row['SeasonBuffVital'].isnumeric() and int(row['SeasonBuffVital']) != 0:
            item['season_bonus']['vitality'] = int(row['SeasonBuffVital'])
        if row['SeasonBuffMagic'].isnumeric() and int(row['SeasonBuffMagic']) != 0:
            item['season_bonus']['magic'] = int(row['SeasonBuffMagic'])
        if row['SeasonBuffLuck'].isnumeric() and int(row['SeasonBuffLuck']) != 0:
            item['season_bonus']['luck'] = int(row['SeasonBuffLuck'])
        if row['SeasonBuffHungry'].isnumeric() and int(row['SeasonBuffHungry']) != 0:
            item['season_bonus']['fullness'] = int(row['SeasonBuffHungry'])
        
        if row['SeasonBuffEnchant'] and row['SeasonBuffEnchant'] != '-':
            item['season_bonus']['enchant'] = parseEnchant(row['SeasonBuffEnchant'], enchants_map)

    return item


item_names = []
items_map = {}
categories_set = set()
source_set = set()


def getItemNames(filename):
    ret = []
    with open(filename, encoding="utf8") as read_obj:
        #data = read_obj.read()
        # csvs are a bit juncky ... '\n' is NOT the ende of the row ... "~Code" is the end of the row (but some times missing =/)
        # also add "End" at the "Header" (line 1)
        # need todo some work by your own =/ ... delimiters are not set right

        reader = DictReader(read_obj)

        # iterate over each line as a ordered dictionary
        for row in reader:
            name = row['NameEn']
            if name:
                ret.append({ "name": name, "Code": row['Code'] })
    
    return ret

def getMaterials():
    materials_map = {}
    with open('Material.csv', encoding="utf8") as read_obj:
        #data = read_obj.read()
        # csvs are a bit juncky ... '\n' is NOT the ende of the row ... "~Code" is the end of the row (but some times missing =/)
        # also add "End" at the "Header" (line 1)
        # need todo some work by your own =/ ... delimiters are not set right

        material_reader = DictReader(read_obj)

        # iterate over each line as a ordered dictionary
        for row in material_reader:
            name = row['NameEn']
            if name:
                new_item = newItem(name, row['SubCategory'])
                if name in items_map:
                    new_item = items_map[name]
                
                categories_set.add(row['SubCategory'])
                categories_set.add(row['Flag'])

                if row['SubCategory'] == 'Material' or row['SubCategory'] == 'ManureBase':
                    new_item['category'] = 'Materials'
                    new_item['sub_category'] = row['SubCategory'] if row['SubCategory'] != '-' else ''
                    new_item = setFertilizerBonus(new_item, row)
                    new_item['description'] = row['CommentEn'].replace('\\1', ',').replace('\n', '')

                    # hotfixes
                    if name == 'Ashigumo Shuriken':
                        new_item['category'] = 'Materials/Misc'

                    materials_map[name] = new_item

                    items_map[name] = new_item
                    items_map[name]['Code'] = row['Code']

    return materials_map


def getFood(item_names, enchants_map):
    food_map = {}

    with open('Food.csv', encoding="utf8") as read_obj:
        #data = read_obj.read()
        # csvs are a bit juncky ... '\n' is NOT the ende of the row ... "~Code" is the end of the row (but some times missing =/)
        # also add "End" at the "Header" (line 1)
        # need todo some work by your own =/ ... delimiters are not set right

        food_reader = DictReader(read_obj)

        # iterate over each line as a ordered dictionary
        for row in food_reader:
            name = row['NameEn']
            if name:
                new_item = newItem(name, row['FoodFlag'])

                if row['FoodFlag'] == 'Material' or row['FoodFlag'] == 'ManureBase' or row['FoodFlag'] == 'Bird' or name in meats or name in vegetables or (name in grains and not 'Rice' in name) or name in materials or name in insects or ' Powder' in name or ' Flakes' in name:
                    new_item['category'] = 'Materials/Ingredients'
                else:
                    new_item['category'] = 'Ingredients'

                new_item['description'] = row['CommentEn'].replace('\\1', ',').replace('\n', '')

                new_item['sub_category'] = row['FoodFlag'] if row['FoodFlag'] != '-' else ''

                if row['Life'].isnumeric() and int(row['Life']) != 0:
                    life = int(row['Life'])
                    new_item['life'] = life
                    if life > 0:
                        new_item['expiable'] = True
                
                if row['Price'].isnumeric() and int(row['Price']) != 0:
                    new_item['price'] = int(row['Price'])

                setFertilizerBonus(new_item, row)
                setFoodBonus(new_item, row, enchants_map)

                # hotfixes
                if name == 'Tea':
                    new_item['fertilizer_bonus']['leaf_fertilizer'] = 5
                    new_item['fertilizer_bonus']['herbicide'] = 1
                    new_item['fertilizer_bonus']['pesticide'] = 1

                auto_list = None
                if '_*Meat|Seafood' in row['Code']:
                    auto_list = meat_seafood
                elif '_*Meat' in row['Code']:
                    auto_list = meats
                elif '_*Vegetable' in row['Code']:
                    auto_list = vegetables
                elif '_*Grain' in row['Code']:
                    auto_list = grains
                elif '_*Insect' in row['Code']:
                    auto_list = insects

                if auto_list:
                    for name in auto_list:
                        new_food_item = new_item
                        new_food_item['name'] = new_item['name'].replace('~Auto~', name)
                        new_food_item['description'] = row['CommentEn'].replace('~Auto~', name).replace('\\1', ',').replace('\n', '')
                        
                        if row['Source'] != '-':
                            new_food_item['ingredients_and'] = parseSource(new_food_item, row['Source'], items_map, item_names, '&', name)
                            new_food_item['ingredients_or'] = parseSource(new_food_item, row['Source'], items_map, item_names, '|', name)
                        
                        food_map[name] = new_food_item
                        
                        items_map[name] = new_food_item
                        items_map[name]['Code'] = row['Code']
                else:
                    if row['Source'] != '-':
                        new_item['ingredients_and'] = parseSource(new_item, row['Source'], items_map, item_names, '&', name)
                        new_item['ingredients_or'] = parseSource(new_item, row['Source'], items_map, item_names, '|', name)
                    
                    food_map[name] = new_item
                    
                    items_map[name] = new_item
                    items_map[name]['Code'] = row['Code']

    return food_map

def getEnchant():
    enchant_map = {}
    with open('Enchant.csv', encoding="utf8") as read_obj:
        enchant_reader = DictReader(read_obj)

        # iterate over each line as a ordered dictionary
        for row in enchant_reader:
            name = row['NameEn']
            if name:
                enchant_map[name] = { "name": name, "Code": row['Code'] }

    return enchant_map

def getCooking(item_names, enchants_map):
    cooking_map = {}
    with open('Cooking.csv', encoding="utf8") as read_obj:
        #data = read_obj.read()
        # csvs are a bit juncky ... '\n' is NOT the ende of the row ... "~Code" is the end of the row (but some times missing =/)
        # also add "End" at the "Header" (line 1)
        # need todo some work by your own =/ ... delimiters are not set right

        cooking_reader = DictReader(read_obj)

        # iterate over each line as a ordered dictionary
        for row in cooking_reader:
            name = row['NameEn']
            if name:
                new_item = newItem(name, 'Food')
                    
                names = [name]
                if re.findall(r'~SourceMain~', name) and row['SourceMain'] != '-':
                    source_main = parseSource(new_item, row['SourceMain'], items_map, item_names, '|')
                    pprint(source_main)
                    names = []
                    for sm in source_main:
                        names.append(sm['name'])

                for name in names:
                    new_item['description'] = row['CommentEn'].replace('\\1', ',').replace('~SourceMain~', name)

                    if row['Source'] != '-':
                        new_item['ingredients_or'] = parseSource(new_item, row['Source'], items_map, item_names, '|', name)
                        new_item['ingredients_and'] = parseSource(new_item, row['Source'], items_map, item_names, '&', name)

                    setFoodBonus(new_item, row, enchants_map)
                    setFoodBonusFromCooking(new_item, row, enchants_map)

                    cooking_map[name] = new_item

                    items_map[name] = new_item
                    items_map[name]['Code'] = row['Code']

    return cooking_map

def main():
    item_names = []
    for name in getItemNames('Material.csv'):
        item_names.append(name)
    for name in getItemNames('Food.csv'):
        item_names.append(name)
    for name in getItemNames('Cooking.csv'):
        item_names.append(name)

    enchant_map = getEnchant()
    materials_map = getMaterials()
    food_map = getFood(item_names, enchant_map)
    cooking_map = getCooking(item_names, enchant_map)

    pprint(categories_set)
    pprint(source_set)

    new_food = []
    new_items = []

    for value in materials_map.values():
        new_items.append(value)
    for value in food_map.values():
        new_items.append(value)

    for value in cooking_map.values():
        new_food.append(value)

    with open(r'new_items.yml', 'w') as file:
        yaml.dump(new_items, file)
    with open(r'new_food.yml', 'w') as file:
        yaml.dump(new_food, file)


if __name__ == "__main__":
    main()
