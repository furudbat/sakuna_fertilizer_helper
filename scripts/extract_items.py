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


enemies_map = {}
old_items = {}
item_names = []

def newItem(name, category):
    return {
        'name': name,
        'category': category,
        'time_of_day': ''
    }

def parseEnchant(enchant, enchants_map):
    ret = []
    for en in enchant.split('|'):
        en = en.strip()
        enchant_level = int(re.findall(r'^[\*a-zA-Z_]+\/(\d+)$', en)[0]) + 1 if re.findall(r'^[\*a-zA-Z_]+\/(\d+)$', en) and re.findall(r'^[a-zA-Z_]+\/(\d+)$', en)[0].isnumeric() else 1
        enchant_code = re.findall(r'^([\*a-zA-Z_]+)\/\d+$', en)[0] if re.findall(r'^([\*a-zA-Z_]+)\/\d+$', en) else ''
        enchant_name = [it for it in enchants_map.values() if it['Code'] == enchant_code][0]['name'] if [it for it in enchants_map.values() if it['Code'] == enchant_code] else ''

        if enchant_name:
            ret.append({ 'name': enchant_name, 'level': enchant_level })

    return ret


def parseItemDrop(itemstr, item_names):
    ret = []

    for item_code in itemstr.split('|'):
        item_code = item_code.strip()

        item_code = re.sub('^F:', '', item_code)
        item_code = re.sub('^M:', '', item_code)
        item_code = re.sub('^C:', '', item_code)

        for drop_item in item_names:
            if item_code == drop_item['Code']:
                ret.append({ "name": drop_item['name'], "Code": drop_item['Code'] })

    return ret


def parseSource(item, sourcestr, item_names, delimiter=None, auto=None, operator=None):
    ret = []

    sources = [sourcestr]
    if delimiter:
        if delimiter in sourcestr:
            sources = sourcestr.split(delimiter)
        else:
            sources = []

    for source in sources:
        source = source.strip()

        source_match = re.search(r'^([_.:\*A-Za-z]+)(\/(\d+))?$', source)
        item_code = source_match.groups()[0] if source_match and source_match.groups()[0] else ''
        amount = int(source_match.groups()[2]) if source_match and source_match.groups()[2] and source_match.groups()[2].isnumeric() else 1

        if item_code == 'Seasoning_Gyoyu':
            for food_item in item_names:
                if food_item['Code'] == 'Seasoning_Gyoyu' or 'Seasoning_Gyoyu' in food_item['Code']:
                    item_name = food_item['name']
                    if item_name and item_name != item['name']:
                        ret.append({"name": item_name, "amount": amount})
        elif item_code == 'Seasoning_Ice':
            for food_item in item_names:
                if food_item['Code'] == 'Seasoning_Ice' or 'Seasoning_Ice' in food_item['Code']:
                    item_name = food_item['name']
                    if item_name and item_name != item['name']:
                        ret.append({"name": item_name, "amount": amount})
        elif re.findall(r'^Flag_([_.:\*A-Za-z]+)$', item_code):
            food_flag = re.search(r'^Flag_([_.:\*A-Za-z]+)$', item_code).groups()[0] if re.search(r'^Flag_([_.:\*A-Za-z]+)$', item_code) else ''
            for food_item in item_names:
                if 'sub_category' in food_item and (food_item['sub_category'] == food_flag or (food_item['sub_category'] == 'SakeSyouchu' and food_flag == 'Sake') or (food_item['sub_category'] == 'SakeSyouchu' and food_flag == 'Syouchu')):
                    item_name = food_item['name']
                    if item_name:
                        ret.append({"name": item_name, "amount": amount})
        elif item_code == '*Auto':
            if auto:
                ret.append({"name": auto, "amount": amount})
            else:
                print("warn: auto is None but '*Auto' was found in {}".format(sourcestr))
        elif item_code == 'Meat':
            if operator == 'and':
                ret.append({"name": 'Meat', "amount": amount})
            else:
                for item_name in meats:
                    if item_name:
                        ret.append({"name": item_name, "amount": amount})
        elif item_code == 'Vegetable':
            if operator == 'and':
                ret.append({"name": 'Vegetables', "amount": amount})
            else:
                for item_name in vegetables:
                    if item_name:
                        ret.append({"name": item_name, "amount": amount})
        elif item_code == 'Seafood':
            if operator == 'and':
                ret.append({"name": 'Seafood', "amount": amount})
            else:
                for item_name in seafood:
                    if item_name:
                        ret.append({"name": item_name, "amount": amount})
        elif item_code == 'Grain':
            if operator == 'and':
                ret.append({"name": 'Grain', "amount": amount})
            else:
                for item_name in grains:
                    if item_name:
                        ret.append({"name": item_name, "amount": amount})
        elif item_code == 'Insect':
            if operator == 'and':
                ret.append({"name": 'Insects', "amount": amount})
            else:
                for item_name in insects:
                    if item_name:
                        ret.append({"name": item_name, "amount": amount})
        else:
            item_name = [it for it in item_names if it['Code'] == item_code][0]['name'] if [it for it in item_names if it['Code'] == item_code] else ''

            if item_name:
                ret.append({"name": item_name, "amount": amount})

    return ret


def setFertilizerBonus(item, row):
    if not 'fertilizer_bonus' in item:
        item['fertilizer_bonus'] = dict()
    
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

    if not item['fertilizer_bonus']:
        del item['fertilizer_bonus']

    return item

def setFoodBonus(item, row, enchants_map):
    if not 'food_bonus' in item:
        item['food_bonus'] = dict()

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
    
    if row['BuffHpMax'] == '*100':
        item['food_bonus']['hp'] = 100
    if row['BuffWpMax'] == '*100':
        item['food_bonus']['sp'] = 100
    if row['BuffStrength'] == '*100':
        item['food_bonus']['strength'] = 100
    if row['BuffVital'] == '*100':
        item['food_bonus']['vitality'] = 100
    if row['BuffMagic'] == '*100':
        item['food_bonus']['magic'] = 100
    if row['BuffLuck'] == '*100':
        item['food_bonus']['luck'] = 100
    if row['BuffHungry'] == '*100':
        item['food_bonus']['fullness'] = 100


    if row['BuffEnchant'] and row['BuffEnchant'] != '-':
        item['food_bonus']['enchant'] = parseEnchant(row['BuffEnchant'], enchants_map)

    if not item['food_bonus']:
        del item['food_bonus']

    return item

def setFoodBonusFromCooking(item, row, enchants_map):
    if row['SeasonBuff'] and row['SeasonBuff'] != '-':
        item['season_buff'] = row['SeasonBuff']
        item['season_bonus'] = dict()

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
        
        if row['SeasonBuffHpMax'] == '*100':
            item['food_bonus']['hp'] = 100
        if row['SeasonBuffWpMax'] == '*100':
            item['food_bonus']['sp'] = 100
        if row['SeasonBuffStrength'] == '*100':
            item['food_bonus']['strength'] = 100
        if row['SeasonBuffVital'] == '*100':
            item['food_bonus']['vitality'] = 100
        if row['SeasonBuffMagic'] == '*100':
            item['food_bonus']['magic'] = 100
        if row['SeasonBuffLuck'] == '*100':
            item['food_bonus']['luck'] = 100
        if row['SeasonBuffHungry'] == '*100':
            item['food_bonus']['fullness'] = 100
            
        if row['SeasonBuffEnchant'] and row['SeasonBuffEnchant'] != '-':
            item['season_bonus']['enchant'] = parseEnchant(row['SeasonBuffEnchant'], enchants_map)

        if not item['season_bonus']:
            del item['season_bonus']
            
    return item

def setEnemyDrops(item, item_code, item_names, enemies_map):
    if not 'enemy_drops' in item:
        item['enemy_drops'] = []
    
    for enemy in enemies_map.values():
        if enemy['Item']:
            for drop in parseItemDrop(enemy['Item'], item_names):
                if item_code == drop['Code']:
                    item['enemy_drops'].append({ 'name': enemy['name'], 'time': enemy['time_of_day'] })
                    item['time_of_day'] = enemy['time_of_day']

    if not item['enemy_drops']:
        del item['enemy_drops']
            
    return item

def getItemNames(filename, category):
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
                item = { "name": name, "Code": row['Code'], "category": category }

                if 'SubCategory' in row and (row['SubCategory'] == 'Material' or row['SubCategory'] == 'ManureBase'):
                    item['category'] = 'Material'
                    item['sub_category'] = row['SubCategory'] if row['SubCategory'] != '-' else ''
                if 'FoodFlag' in row and (row['FoodFlag'] == 'Material' or row['FoodFlag'] == 'ManureBase' or row['FoodFlag'] == 'Bird' or name in meats or name in vegetables or (name in grains and not 'Rice' in name) or name in materials or name in insects or ' Powder' in name or ' Flakes' in name):
                    item['category'] = 'Material/Food'
                    item['sub_category'] = row['FoodFlag'] if row['FoodFlag'] != '-' else ''
                elif 'FoodFlag' in row:
                    item['category'] = 'Food'
                    item['sub_category'] = row['FoodFlag'] if row['FoodFlag'] != '-' else ''

                ret.append(item)
    
    return ret

def getMaterials(item_names, enemies_map):
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
                for it in old_items:
                    if new_item == it['name']:
                        new_item = it.copy()

                if row['SubCategory'] == 'Material' or row['SubCategory'] == 'ManureBase':
                    new_item['category'] = 'Material'
                    if row['SubCategory'] != '-':
                        new_item['sub_category'] = row['SubCategory']
                elif row['SubCategory'] != '':
                    new_item['category'] = row['SubCategory']
                
                new_item['description'] = row['CommentEn'].replace('\\1', ', ')

                setFertilizerBonus(new_item, row)
                hotfixMaterial(name, new_item)
                setEnemyDrops(new_item, row['Code'], item_names, enemies_map)

                materials_map[name] = new_item

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
                for it in old_items:
                    if new_item == it['name']:
                        new_item = it.copy()
                
                if row['FoodFlag'] == 'Material' or row['FoodFlag'] == 'ManureBase' or row['FoodFlag'] == 'Bird' or name in meats or name in vegetables or (name in grains and not 'Rice' in name) or name in materials or name in insects or ' Powder' in name or ' Flakes' in name:
                    new_item['category'] = 'Material/Food'
                else:
                    new_item['category'] = 'Food'

                new_item['description'] = row['CommentEn'].replace('\\1', ',').replace('\n', '')
                if row['FoodFlag'] != '-':
                    new_item['sub_category'] = row['FoodFlag'] 

                if row['Life'].isnumeric() and int(row['Life']) != 0:
                    life = int(row['Life'])
                    new_item['life'] = life
                    if life > 0:
                        new_item['expiable'] = True
                
                if row['Price'].isnumeric() and int(row['Price']) != 0:
                    new_item['price'] = int(row['Price'])

                setFertilizerBonus(new_item, row)
                setFoodBonus(new_item, row, enchants_map)

                auto_list = None
                if '_*Meat|Seafood' in row['Code']:
                    auto_list = meat_seafood
                elif '_*Seafood' in row['Code']:
                    auto_list = seafood
                elif '_*Meat' in row['Code']:
                    auto_list = meats
                elif '_*Vegetable' in row['Code']:
                    auto_list = vegetables
                elif '_*Grain' in row['Code']:
                    auto_list = grains
                elif '_*Insect' in row['Code']:
                    auto_list = insects

                if auto_list:
                    for auto in auto_list:
                        name = new_item['name'].replace('~Auto~', auto)

                        new_food_item = new_item.copy()
                        new_food_item['name'] = name
                        new_food_item['description'] = row['CommentEn'].replace('~Auto~', auto).replace('\\1', ', ')
                        
                        hotfixFood(name, new_food_item)

                        if row['Source'] != '-':
                            new_food_item['ingredients_and'] = parseSource(new_food_item, row['Source'], item_names, '&', auto, 'and')
                            new_food_item['ingredients_or'] = parseSource(new_food_item, row['Source'], item_names, '|', auto, 'or')
                            if not new_food_item['ingredients_and'] and not new_food_item['ingredients_or']:
                                new_food_item['ingredients_or'] = parseSource(new_food_item, row['Source'], item_names, None, auto, None)
                        

                        food_map[name] = new_food_item
                else:
                    new_item = hotfixFood(name, new_item)

                    if row['Source'] != '-':
                        new_item['ingredients_and'] = parseSource(new_item, row['Source'], item_names, '&', name, 'and')
                        new_item['ingredients_or'] = parseSource(new_item, row['Source'], item_names, '|', name, 'or')
                        if not new_item['ingredients_and'] and not new_item['ingredients_or']:
                            new_item['ingredients_or'] = parseSource(new_item, row['Source'], item_names, None, name, None)
                    
                    
                    food_map[name] = new_item

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
                for it in old_items:
                    if new_item == it['name']:
                        new_item = it.copy()
                    
                names = [name]
                if '~SourceMain~' in name and row['SourceMain'] != '-':
                    source_main = parseSource(new_item, row['SourceMain'], item_names, '|', None, 'or')
                    names = []
                    for sm in source_main:
                        names.append(sm['name'])

                for source in names:
                    name = row['NameEn'].replace('~SourceMain~', source)
                    new_item['name'] = name
                    new_item['description'] = row['CommentEn'].replace('\\1', ',').replace('~SourceMain~', source)

                    if row['SourceMain'] != '-':
                        source_main = parseSource(new_item, row['SourceMain'], item_names, '|', None, 'or')
                        if not source_main:
                            source_main = parseSource(new_item, row['SourceMain'], item_names, None, source, None)
                        for sm in source_main:
                            if sm['name'] == name:
                                new_item['main_ingredients'] = sm
                    if row['Source'] != '-':
                        new_item['ingredients_or'] = parseSource(new_item, row['Source'], item_names, '|', None, 'or')
                        new_item['ingredients_and'] = parseSource(new_item, row['Source'], item_names, '&', None, 'and')

                    new_item = setFoodBonus(new_item, row, enchants_map)
                    new_item = setFoodBonusFromCooking(new_item, row, enchants_map)
                    new_item = hotfixCooking(name, new_item)

                    cooking_map[name] = new_item

    return cooking_map

def getEnemies():
    enemies_map = {}
    with open('EnemyDrop.csv', encoding="utf8") as read_obj:
        enemies_reader = DictReader(read_obj)

        # iterate over each line as a ordered dictionary
        for row in enemies_reader:
            name = row['Name']
            enemies_map[name] = { 
                "name": name,
                "Code": row['Name'],
                "min_level": int(row['LevelMin']) if row['LevelMin'].isnumeric() else 0,
                "max_level": int(row['LevelMax']) if row['LevelMax'].isnumeric() else 0,
                "Item": row['Item'],
                "time_of_day": row['Time']
            }

    return enemies_map


def hotfixCooking(name, item):
    return item

def hotfixMaterial(name, item):
    if name == 'Ashigumo Shuriken':
        item['category'] = 'Materials/Misc'

    return item

def hotfixFood(name, item):
    if name == 'Tea':
        if not 'fertilizer_bonus' in item:
            item['fertilizer_bonus'] = dict()
        item['fertilizer_bonus']['leaf_fertilizer'] = 5
        item['fertilizer_bonus']['herbicide'] = 1
        item['fertilizer_bonus']['pesticide'] = 1

    return item


def main():
    with open('old_items.yml') as f:
        old_items = yaml.load(f, Loader=yaml.FullLoader)

    item_names = []
    for name in getItemNames('Material.csv', 'Materials'):
        item_names.append(name)
    for name in getItemNames('Food.csv', 'Food'):
        item_names.append(name)
    for name in getItemNames('Cooking.csv', 'Cooking'):
        item_names.append(name)

    enemies_map = getEnemies()
    enchant_map = getEnchant()
    materials_map = getMaterials(item_names, enemies_map)
    food_map = getFood(item_names, enchant_map)
    cooking_map = getCooking(item_names, enchant_map)

    items = []
    for value in materials_map.values():
        items.append(value)
    for value in food_map.values():
        items.append(value)
    for value in cooking_map.values():
        items.append(value)

    with open(r'materials.yml', 'w') as file:
        yaml.dump(list(materials_map.values()), file)
    with open(r'food.yml', 'w') as file:
        yaml.dump(list(food_map.values()), file)
    with open(r'cooking.yml', 'w') as file:
        yaml.dump(list(cooking_map.values()), file)
    with open(r'items.yml', 'w') as file:
        yaml.dump(items, file)


if __name__ == "__main__":
    main()
