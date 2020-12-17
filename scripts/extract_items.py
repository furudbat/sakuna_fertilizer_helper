#! /usr/bin/python

import os
import json
import yaml
import re
import io
from csv import DictReader
from pprint import pprint

insects = []
meat = []
vegetables = []
seafood = []
grains = []
meat_seafood = []
spices = []

materials = [
    'Salt',
    'Sugar',
    'Tea',
    'Fish Mint'
    'Sesame',
    'Kombu Kelp',
    'Oil',
    'Fish Oil',
    'Vegetable Oil',
    'Vinegar',
    'Rice Bran',
    'Spring Water',
    'Renowed Water',
    'Medicinal Base',
    'Rotten Food',
    'Foxtail Millet',
    'Sanwa Millet',
    'Bee Larva',
    'Grasshopper',
    'Bean',
    'Buckwheat',
    'Acorn',
    'Mushroom',
    'Maize'
]

CATEGORY_MISC = 'Misc'
CATEGORY_MATERIAL = 'Materials'
CATEGORY_MATERIAL_FOOD = 'Materials/Food'
CATEGORY_MATERIAL_MISC = 'Materials/Misc'
CATEGORY_MATERIAL_COOKING = 'Materials/Cooking'
CATEGORY_FOOD = 'Food'
CATEGORY_COOKING = 'Cooking'

old_items = {}


def newItem(name, category):
    return {
        'name': name,
        'category': category
    }

def parseEnchant(enchantstr, enchants_map):
    ret = []

    for enchant in enchants_map.values():
        enchant_code = enchant['Code']
        enchant_name = enchant['name']
        
        enchant_regex_str = "({})(\\/(\\d+))?".format(enchant_code)
        enchant_match = re.search(enchant_regex_str, enchantstr)
        enchant_level = int(enchant_match.groups()[2]) + 1 if enchant_match and enchant_match.groups()[2] and enchant_match.groups()[2].isnumeric() else 1

        if enchant_match:
            ret.append({ 'name': enchant_name, 'level': enchant_level })
        
    if not ret:
        print("parseEnchant: not found: {}".format(enchantstr))

    return ret


def parseItemDrop(itemstr, item_names):
    ret = []

    for item_code in itemstr.split('|'):
        item_code = item_code.strip()

        item_code = re.sub('^F:', '', item_code)
        item_code = re.sub('^M:', '', item_code)
        item_code = re.sub('^C:', '', item_code)
        item_code = re.sub('^Ex:', '', item_code)

        for drop_item in item_names:
            if item_code == drop_item['Code']:
                ret.append({ "name": drop_item['name'], "Code": drop_item['Code'] })

    if len(ret) == 0:
        print("parseItemDrop: ret is empty {}".format(itemstr))

    return ret


def parseSource(item, sourcestr, item_names, auto_name=None):
    ret = []

    sources = [sourcestr]
    if '|' in sourcestr or '&' in sourcestr:
        sources = sourcestr.split(' ')

    for i in range(0, len(sources), 2):
        operator = ''
        source = ''

        source = sources[i]
        if i+1 < len(sources):
            if sources[i+1] == '|':
                operator = 'or'
            if sources[i+1] == '&':
                operator = 'and'
        else:
            operator = ''

        if source:
            source_match = re.search(r'^([_.:\*A-Za-z]+)(\/(\d+))?$', source)
            item_code = source_match.groups()[0] if source_match and source_match.groups()[0] else ''
            amount = int(source_match.groups()[2]) if source_match and source_match.groups()[2] and source_match.groups()[2].isnumeric() else 1

            item_code = re.sub('^F:', '', item_code)
            item_code = re.sub('^M:', '', item_code)
            item_code = re.sub('^C:', '', item_code)
            item_code = re.sub('^Ex:', '', item_code)
            
            if re.findall(r'^Flag_([_.:\*A-Za-z]+)$', item_code):
                food_flag = re.search(r'^Flag_([_.:\*A-Za-z]+)$', item_code).groups()[0] if re.search(r'^Flag_([_.:\*A-Za-z]+)$', item_code) else ''
                find_items = False
                for food_item in item_names:
                    if 'sub_category' in food_item and food_item['sub_category']:
                        if food_flag in food_item['sub_category']:
                            item_name = food_item['name']
                            if item_name:
                                ret.append({"name": item_name, "amount": amount, "operator": "or"})
                                find_items = True
                if find_items:
                    ret[-1]['operator'] = ''
                else:
                    pprint(ret)
                    print("parseSource: flag {} not found, {}: {}".format(food_flag, item['name'], sourcestr))
            elif item_code == '*Auto':
                if auto_name:
                    ret.append({"name": auto_name, "amount": amount, "operator": operator})
                else:
                    print("warn: auto is None but '*Auto' was found in {}".format(sourcestr))
            elif item_code == '*Ex:Saiken':
                # TODO: what is Ex:Saiken ???
                ret.append({"name": 'Saiken ???', "amount": amount, "operator": operator})
            elif item_code == 'Meat':
                for meat_item in meat:
                    if meat_item['name']:
                        ret.append({"name": meat_item['name'], "amount": amount, "operator": "or"})
                ret[-1]['operator'] = ''
            elif item_code == 'Vegetable':
                for vegetable_item in vegetables:
                    if vegetable_item['name']:
                        ret.append({"name": vegetable_item['name'], "amount": amount, "operator": "or"})
                ret[-1]['operator'] = ''
            elif item_code == 'Seafood':
                for seafood_item in seafood:
                    if seafood_item['name']:
                        ret.append({"name": seafood_item['name'], "amount": amount, "operator": "or"})
                ret[-1]['operator'] = ''
            elif item_code == 'Grain':
                for grain_item in grains:
                    if grain_item['name']:
                        ret.append({"name": grain_item['name'], "amount": amount, "operator": "or"})
                ret[-1]['operator'] = ''
            elif item_code == 'Insect':
                for insect_item in insects:
                    if insect_item['name']:
                        ret.append({"name": insect_item['name'], "amount": amount, "operator": "or"})
                ret[-1]['operator'] = ''
            elif item_code == 'Spice':
                for spice_item in spices:
                    if spice_item['name']:
                        ret.append({"name": spice_item['name'], "amount": amount, "operator": "or"})
                ret[-1]['operator'] = ''
            else:
                find_item = False
                for it in item_names:
                    find_item = False
                    find_item = it['Code'] == item_code
                    find_item = find_item or (it['Code'] == 'Seasoning_Gyoyu' and 'Seasoning_Gyoyu' == item_code)
                    find_item = find_item or (it['Code'] == 'Drink_DoburokuSeasoning_Ice' and 'Seasoning_Ice' == item_code)
                    find_item = find_item or (it['Code'] == 'GrainGrain_Mugi' and 'Grain_Mugi' == item_code)
                    find_item = find_item or (it['Code'] == 'Preserve_SushiPreserve_Cheese' and 'Preserve_Cheese' == item_code)
                    find_item = find_item or (item_code == 'Preserve_Kunsei_Meat_Buta' and it['name'] == 'Smoked Pork')
                    find_item = find_item or (it['Code'] == 'Drink_DoburokuPreserve_Imogaranawa' and 'Preserve_Imogaranawa' == item_code)
                    find_item = find_item or (it['Code'] == 'Vegetable_SyungikuVegetable_Nanakusa' and ('Vegetable_Syungiku' == item_code or 'Vegetable_Nanakusa' == item_code))
                    find_item = find_item or (it['Code'] == 'Drink_DoburokuDrink_Meisui' and 'Drink_Meisui' == item_code)
                    find_item = find_item or (it['Code'] == 'Drink_DoburokuDrink_Kiyomizu' and 'Drink_Kiyomizu' == item_code)
                    find_item = find_item or (it['Code'] == 'Drink_DoburokuPreserve_Umeboshi' and 'Preserve_Umeboshi' == item_code)
                    find_item = find_item or (it['Code'] == 'Drink_SeisyuDrink_Ginjyou' and 'Drink_Seisyu' == item_code)
                    find_item = find_item or (it['Code'] == 'Drink_SeisyuDrink_Ginjyou' and 'Drink_Ginjyou' == item_code)
                    find_item = find_item or (it['Code'] == 'Drink_SeisyuDrink_Daiginjyou' and 'Drink_Daiginjyou' == item_code)
                    find_item = find_item or (it['Code'] == 'Drink_SeisyuDrink_Beer' and 'Drink_Beer' == item_code)

                    if find_item:
                        item_name = it['name']
                        if item_name:
                            ret.append({"name": item_name, "amount": amount, "operator": operator})
                        break
                if not find_item:
                    pprint(ret)
                    print("parseSource: {} not found, {}: {}".format(item_code, item['name'], sourcestr))

    if len(ret) == 0:
        print("parseSource: {} ret is empty {}".format(item['name'], sourcestr))

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
        item['fertilizer_bonus']['hardness_vitality'] = int(row['Mnr_Hardness'])
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

    if 'food_bonus' in item and 'enchant' in item['food_bonus'] and not item['food_bonus']['enchant']:
        del item['food_bonus']['enchant']
        
    if not item['food_bonus']:
        del item['food_bonus']

    return item

def setFoodBonusFromCooking(item, row, enchants_map):
    if row['SeasonBuff'] and row['SeasonBuff'] != '-':
        item['season_buff'] = row['SeasonBuff']
        item['season_food_bonus'] = dict()

        if row['SeasonBuffHpMax'].isnumeric() and int(row['SeasonBuffHpMax']) != 0:
            item['season_food_bonus']['hp'] = int(row['SeasonBuffHpMax'])
        if row['SeasonBuffWpMax'].isnumeric() and int(row['SeasonBuffWpMax']) != 0:
            item['season_food_bonus']['sp'] = int(row['SeasonBuffWpMax'])
        if row['SeasonBuffStrength'].isnumeric() and int(row['SeasonBuffStrength']) != 0:
            item['season_food_bonus']['strength'] = int(row['SeasonBuffStrength'])
        if row['SeasonBuffVital'].isnumeric() and int(row['SeasonBuffVital']) != 0:
            item['season_food_bonus']['vitality'] = int(row['SeasonBuffVital'])
        if row['SeasonBuffMagic'].isnumeric() and int(row['SeasonBuffMagic']) != 0:
            item['season_food_bonus']['magic'] = int(row['SeasonBuffMagic'])
        if row['SeasonBuffLuck'].isnumeric() and int(row['SeasonBuffLuck']) != 0:
            item['season_food_bonus']['luck'] = int(row['SeasonBuffLuck'])
        if row['SeasonBuffHungry'].isnumeric() and int(row['SeasonBuffHungry']) != 0:
            item['season_food_bonus']['fullness'] = int(row['SeasonBuffHungry'])

        if row['SeasonBuffHpMax'] == '*100':
            item['season_food_bonus']['hp'] = 100
        if row['SeasonBuffWpMax'] == '*100':
            item['season_food_bonus']['sp'] = 100
        if row['SeasonBuffStrength'] == '*100':
            item['season_food_bonus']['strength'] = 100
        if row['SeasonBuffVital'] == '*100':
            item['season_food_bonus']['vitality'] = 100
        if row['SeasonBuffMagic'] == '*100':
            item['season_food_bonus']['magic'] = 100
        if row['SeasonBuffLuck'] == '*100':
            item['season_food_bonus']['luck'] = 100
        if row['SeasonBuffHungry'] == '*100':
            item['season_food_bonus']['fullness'] = 100
            
        if row['SeasonBuffEnchant'] and row['SeasonBuffEnchant'] != '-':
            item['season_food_bonus']['enchant'] = parseEnchant(row['SeasonBuffEnchant'], enchants_map)

        if 'season_bonus' in item and 'enchant' in item['season_food_bonus'] and not item['season_food_bonus']['enchant']:
            del item['season_food_bonus']['enchant']

        if not item['season_food_bonus']:
            del item['season_food_bonus']
            
    return item

def setFoodWhenSpoiled(item, row, item_names):
    if row['LostGenerate'] and row['LostGenerate'] != '-':
        when_spoiled = parseLostGenerate(row['LostGenerate'], item_names)
        if when_spoiled:
            item['when_spoiled'] = when_spoiled['name']

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

def setCollectionDrops(item, item_code, item_names, worldmap_collection_map):
    if not 'find_in' in item:
        item['find_in'] = []
    
    for collection in worldmap_collection_map.values():
        if 'always' in collection:
            for drop in collection['always']:
                if item_code == drop['Code']:
                    new_find_in = { 'name': collection['name'], 'percent': drop['percent'], 'season': 'Always' }
                    if 'try' in collection:
                        new_find_in['try'] = collection['try']
                    item['find_in'].append(new_find_in)
        if 'spring' in collection:
            for drop in collection['spring']:
                if item_code == drop['Code']:
                    new_find_in = { 'name': collection['name'], 'percent': drop['percent'], 'season': 'Spring' }
                    if 'try' in collection:
                        new_find_in['try'] = collection['try']
                    item['find_in'].append(new_find_in)
        if 'summer' in collection:
            for drop in collection['summer']:
                if item_code == drop['Code']:
                    new_find_in = { 'name': collection['name'], 'percent': drop['percent'], 'season': 'Summer' }
                    if 'try' in collection:
                        new_find_in['try'] = collection['try']
                    item['find_in'].append(new_find_in)
        if 'autumn' in collection:
            for drop in collection['autumn']:
                if item_code == drop['Code']:
                    new_find_in = { 'name': collection['name'], 'percent': drop['percent'], 'season': 'Autumn' }
                    if 'try' in collection:
                        new_find_in['try'] = collection['try']
                    item['find_in'].append(new_find_in)
        if 'winter' in collection:
            for drop in collection['winter']:
                if item_code == drop['Code']:
                    new_find_in = { 'name': collection['name'], 'percent': drop['percent'], 'season': 'Winter' }
                    if 'try' in collection:
                        new_find_in['try'] = collection['try']
                    item['find_in'].append(new_find_in)

    if not item['find_in']:
        del item['find_in']
            
    return item

def setFoodCategory(item, row):
    name = item['name']
    if 'FoodFlag' in row and (row['FoodFlag'] == 'Material' or row['FoodFlag'] == 'ManureBase' or row['FoodFlag'] == 'Bird' or ' Powder' in name or ' Flakes' in name):
        item['category'] = CATEGORY_MATERIAL_FOOD
        item['sub_category'] = row['FoodFlag'] if row['FoodFlag'] != '-' else ''
    elif 'FoodFlag' in row:
        item['category'] = CATEGORY_FOOD
        item['sub_category'] = row['FoodFlag'] if row['FoodFlag'] != '-' else ''

    for it in materials:
        if item['name'] == it:
            item['category'] = CATEGORY_MATERIAL

    for it in meat_seafood:
        if item['name'] == it['name']:
            item['category'] = CATEGORY_MATERIAL_FOOD
            item['sub_category'] = row['FoodFlag'] if row['FoodFlag'] != '-' else ''
    for it in insects:
        if item['name'] == it['name']:
            item['category'] = CATEGORY_MATERIAL_FOOD
            item['sub_category'] = row['FoodFlag'] if row['FoodFlag'] != '-' else ''
    for it in grains:
        if item['name'] == it['name'] and not 'Rice' in item['name']:
            item['category'] = CATEGORY_MATERIAL_FOOD
            item['sub_category'] = row['FoodFlag'] if row['FoodFlag'] != '-' else ''

    return item

def getItemNames(filename, category, item_names, only_names=False):
    ret = []
    if filename == 'Material.csv' and not only_names:
        ret = getMaterials(item_names, {}, {}, True).values()
    elif filename == 'Food.csv' and not only_names:
        ret = getFood(item_names, {}, {}, {}, True).values()
    elif filename == 'Cooking.csv' and not only_names:
        ret = getCooking(item_names, {}, {}, {}, True).values()
    else:
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
                        item['category'] = CATEGORY_MATERIAL
                        item['sub_category'] = row['SubCategory'] if row['SubCategory'] != '-' else ''
                    else:
                        item = setFoodCategory(item, row)

                    ret.append(item)
    
    return ret

def getMaterials(item_names, enemies_map, worldmap_collection_map, only_name=False):
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
                    if name == it['name']:
                        new_item = it.copy()

                if row['SubCategory'] == 'Material' or row['SubCategory'] == 'ManureBase':
                    new_item['category'] = CATEGORY_MATERIAL
                    if row['SubCategory'] != '-':
                        new_item['sub_category'] = row['SubCategory']
                elif row['SubCategory'] != '':
                    new_item['category'] = row['SubCategory']

                item_code = row['Code']
                if only_name:
                    new_item['Code'] = item_code
                else:
                    new_item['description'] = row['CommentEn'].replace('\\1', ', ')

                    new_item = setFertilizerBonus(new_item, row)
                    new_item = setEnemyDrops(new_item, item_code, item_names, enemies_map)
                    new_item = setCollectionDrops(new_item, item_code, item_names, worldmap_collection_map)

                    new_item = hotfixMaterial(name, new_item)

                materials_map[item_code] = new_item

    return materials_map


def getFood(item_names, enchants_map, enemies_map, worldmap_collection_map, only_name=False):
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
                    if name == it['name']:
                        new_item = it.copy()
                
                new_item = setFoodCategory(new_item, row)

                if not only_name:
                    new_item['description'] = row['CommentEn'].replace('\\1', ',').replace('\n', '')

                    if row['Life'].isnumeric() and int(row['Life']) != 0:
                        life = int(row['Life'])
                        new_item['life'] = life
                        if life > 0:
                            new_item['expiable'] = True
                    
                    if row['Price'].isnumeric() and int(row['Price']) != 0:
                        new_item['price'] = int(row['Price'])

                    new_item = setFertilizerBonus(new_item, row)
                    new_item = setFoodBonus(new_item, row, enchants_map)

                auto_list = None
                if '_*Meat|Seafood' in row['Code']:
                    auto_list = meat_seafood
                elif '_*Seafood' in row['Code']:
                    auto_list = seafood
                elif '_*Meat' in row['Code']:
                    auto_list = meat
                elif '_*Vegetable' in row['Code']:
                    auto_list = vegetables
                elif '_*Grain' in row['Code']:
                    auto_list = grains
                elif '_*Insect' in row['Code']:
                    auto_list = insects

                if auto_list:
                    for auto in auto_list:
                        name = new_item['name'].replace('~Auto~', auto['name'])
                        new_food_item = new_item.copy()

                        new_food_item['name'] = name
                        
                        item_code = row['Code']
                        if '_*Meat|Seafood' in row['Code']:
                            item_code = row['Code'].replace('*Meat|Seafood', auto['Code'])
                        elif '_*Seafood' in row['Code']:
                            item_code = row['Code'].replace('*Seafood', auto['Code'])
                        elif '_*Meat' in row['Code']:
                            item_code = row['Code'].replace('*Meat', auto['Code'])
                        elif '_*Vegetable' in row['Code']:
                            item_code = row['Code'].replace('*Vegetable', auto['Code'])
                        elif '_*Grain' in row['Code']:
                            item_code = row['Code'].replace('*Grain', auto['Code'])
                        elif '_*Insect' in row['Code']:
                            item_code = row['Code'].replace('*Insect', auto['Code'])

                        if only_name:
                            new_food_item['Code'] = item_code
                        else:
                            new_food_item['description'] = row['CommentEn'].replace('~Auto~', auto['name']).replace('\\1', ', ')
                                    
                            if row['Source'] != '-':
                                new_food_item['ingredients'] = parseSource(new_food_item, row['Source'], item_names, auto['name'])
                                if len(new_food_item['ingredients']) == 0:
                                    del new_food_item['ingredients']
                            
                            new_food_item = setEnemyDrops(new_food_item, item_code, item_names, enemies_map)
                            new_food_item = setCollectionDrops(new_food_item, item_code, item_names, worldmap_collection_map)
                            new_food_item = setFoodWhenSpoiled(new_food_item, row, item_names)

                            hotfixFood(new_food_item['name'], new_food_item)
                            
                        food_map[item_code] = new_food_item
                else:
                    item_code = row['Code']
                    if only_name:
                        new_item['Code'] = item_code
                    else:
                        if row['Source'] != '-':
                            new_item['ingredients'] = parseSource(new_item, row['Source'], item_names, name)
                            if len(new_item['ingredients']) == 0:
                                    del new_item['ingredients']

                        new_item = setEnemyDrops(new_item, item_code, item_names, enemies_map)
                        new_item = setCollectionDrops(new_item, item_code, item_names, worldmap_collection_map)
                        new_item = setFoodWhenSpoiled(new_item, row, item_names)

                        hotfixFood(new_item['name'], new_item)
                    
                    food_map[item_code] = new_item

    return food_map

def getCooking(item_names, enchants_map, food_map, worldmap_collection_map, only_names=False):
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
                new_item = newItem(name, 'Cooking')

                for it in old_items:
                    if name == it['name']:
                        new_item = it.copy()
                for it in food_map.values():
                    if name == it['name']:
                        new_item = it.copy()
                        new_item['category'] = 'Cooking'
                    
                names = [name]
                if '~SourceMain~' in name and row['SourceMain'] != '-':
                    source_main = parseSource(new_item, row['SourceMain'], item_names)
                    names = []
                    for sm in source_main:
                        names.append(sm['name'])

                for source in names:
                    new_food_item = new_item.copy()
                    name = row['NameEn'].replace('~SourceMain~', source)
                    new_food_item['name'] = name

                    if only_names:
                        new_food_item['Code'] = row['Code']
                    else:
                        new_food_item['description'] = row['CommentEn'].replace('\\1', ',').replace('~SourceMain~', source)

                        if row['SourceMain'] != '-':
                            source_main = parseSource(new_food_item, row['SourceMain'], item_names)
                            if source and not 'main_ingredients' in new_food_item and source_main:
                                new_food_item['main_ingredients'] = source_main
                                if len(new_food_item['main_ingredients']) == 0:
                                        del new_food_item['main_ingredients']
                        
                        if row['Source'] != '-':
                            source = parseSource(new_food_item, row['Source'], item_names)
                            if source and not 'ingredients' in new_food_item:
                                new_food_item['ingredients'] = source
                                if len(new_food_item['ingredients']) == 0:
                                        del new_food_item['ingredients']

                        new_food_item = setFoodBonus(new_food_item, row, enchants_map)
                        new_food_item = setFoodBonusFromCooking(new_food_item, row, enchants_map)

                        new_food_item = hotfixCooking(name, new_food_item)

                    cooking_map[row['Code']] = new_food_item

    return cooking_map



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

def getEnemies():
    enemies_map = {}
    with open('EnemyDrop.csv', encoding="utf8") as read_obj:
        enemies_reader = DictReader(read_obj)

        # iterate over each line as a ordered dictionary
        for row in enemies_reader:
            code = row['Name']

            # TODO get enemy name
            name = row['Name']

            enemies_map[code] = { 
                "name": name,
                "Code": code,
                "min_level": int(row['LevelMin']) if row['LevelMin'].isnumeric() else 0,
                "max_level": int(row['LevelMax']) if row['LevelMax'].isnumeric() else 0,
                "Item": row['Item'],
                "time_of_day": row['Time']
            }

    return enemies_map

def getWorldmapLandmarks():
    worldmap_landmark_map = {}
    with open('WorldmapLandmark.csv', encoding="utf8") as read_obj:
        worldmap_landmark_reader = DictReader(read_obj)

        # iterate over each line as a ordered dictionary
        for row in worldmap_landmark_reader:
            name = row['NameEn']
            code = row['Code']
            if code and name:
                worldmap_landmark_map[code] = { "name": name, "Code": code }

    return worldmap_landmark_map

def parseLostGenerate(itemstr, item_names):
    lost_item_match = re.search(r'(M:|F:|C:|Ex:)?(\S+)', itemstr)
    lost_item_code = lost_item_match.groups()[1] if lost_item_match and lost_item_match.groups()[1] else ''

    if lost_item_code:
        for item in item_names:
            item_name = item['name']
            item_code = item['Code']

            find_item = item_code == lost_item_code
            find_item = find_item or (item_code == 'PanaceaPanaceaSenshi' and 'PanaceaSenshi' in lost_item_code)
            find_item = find_item or (item_code == 'PanaceaPanaceaHohi' and 'PanaceaHohi' in lost_item_code)
            find_item = find_item or (item_code == 'Vegetable_SyungikuVegetable_Nanakusa' and ('Vegetable_Nanakusa' in lost_item_code or 'Vegetable_Syungiku' in lost_item_code))
            
            if find_item:
                return { 'name': item_name, 'Code': item_code }
    
    print("parseLostGenerate: {} not found: {}".format(lost_item_code, itemstr))

    return None


def parseWorldmapCollectionItem(itemsstr, item_names):
    ret = []

    for itemstr in itemsstr.split('|'):
        collection_item_match = re.search(r'(M:|F:|C:|Ex:)?(\S+) (\d+)', itemstr)
        collection_item_code = collection_item_match.groups()[1] if collection_item_match and collection_item_match.groups()[1] else ''
        collection_item_percent = int(collection_item_match.groups()[2]) if collection_item_match and collection_item_match.groups()[2] and collection_item_match.groups()[2].isnumeric() else 1

        find_items = False
        if collection_item_code:
            for item in item_names:
                item_name = item['name']
                item_code = item['Code']

                find_item = item_code == collection_item_code
                find_item = find_item or (item_code == 'PanaceaPanaceaSenshi' and 'PanaceaSenshi' in collection_item_code)
                find_item = find_item or (item_code == 'PanaceaPanaceaHohi' and 'PanaceaHohi' in collection_item_code)
                find_item = find_item or (item_code == 'Vegetable_SyungikuVegetable_Nanakusa' and ('Vegetable_Nanakusa' in collection_item_code or 'Vegetable_Syungiku' in collection_item_code))
                
                if find_item:
                    ret.append({ 'name': item_name, 'Code': item_code, 'percent': collection_item_percent })
                    find_items = True
        
        if not find_items:
            print("parseWorldmapCollectionItem: {} not found: {}".format(collection_item_code, itemsstr))

    return ret

def getWorldmapCollection(worldmap_landmark_map, item_names):
    worldmap_collection_map = {}
    with open('WorldmapCollect.csv', encoding="utf8") as read_obj:
        worldmap_collect_reader = DictReader(read_obj)

        # iterate over each line as a ordered dictionary
        for row in worldmap_collect_reader:
            code = row['Place']
            name = worldmap_landmark_map[code]['name'] if worldmap_landmark_map[code] else ''
            if code:
                collection = { "name": name, "Code": code }
                
                if row['Try'].isnumeric() and int(row['Try']) != 0:
                    collection['try'] = int(row['Try'])

                if row['Item_Always'] and row['Item_Always'] != '-':
                    collection['always'] = parseWorldmapCollectionItem(row['Item_Always'], item_names)
                if row['Item_Spring'] and row['Item_Spring'] != '-':
                    collection['spring'] = parseWorldmapCollectionItem(row['Item_Spring'], item_names)
                if row['Item_Summer'] and row['Item_Summer'] != '-':
                    collection['summer'] = parseWorldmapCollectionItem(row['Item_Summer'], item_names)
                if row['Item_Autumn'] and row['Item_Autumn'] != '-':
                    collection['autumn'] = parseWorldmapCollectionItem(row['Item_Autumn'], item_names)
                if row['Item_Winter'] and row['Item_Winter'] != '-':
                    collection['winter'] = parseWorldmapCollectionItem(row['Item_Winter'], item_names)

                worldmap_collection_map[code] = collection

    return worldmap_collection_map

def hotfixCooking(name, item):
    if 'fertilizer_bonus' in item and item['fertilizer_bonus']:
        item['category'] = CATEGORY_MATERIAL_COOKING
        
    for material in materials:
        if material == name:
            item['category'] = CATEGORY_MATERIAL_COOKING

    if 'Cooking' in item['category'] and not 'main_ingredients' in item and not 'ingredients' in item and item['name'] != 'Water':
        print('hotfixFood: cooking without ingredients: {}'.format(name))
    
    if not 'Cooking' in item['category'] and ('main_ingredients' in item or 'ingredients' in item):
            print('hotfixFood: ingredients without cooking category: {}, {}'.format(name, item['category']))

    return item

def hotfixMaterial(name, item):
    if name == 'Ashigumo Shuriken':
        item['category'] = CATEGORY_MISC
    if name == 'Powder of Transformation':
        item['category'] = CATEGORY_MATERIAL_MISC
    if name == 'Orb of Transformation':
        item['category'] = CATEGORY_MATERIAL_MISC
    if name == "Health's Bounty":
        item['category'] = CATEGORY_MATERIAL_MISC
    if name == "Skill's Bounty":
        item['category'] = CATEGORY_MATERIAL_MISC
    if name == "Strength's Bounty":
        item['category'] = CATEGORY_MATERIAL_MISC
    if name == "Vitality's Bounty":
        item['category'] = CATEGORY_MATERIAL_MISC
    if name == "Fullness' Bounty":
        item['category'] = CATEGORY_MATERIAL_MISC
    if name == "Luck's Bounty":
        item['category'] = CATEGORY_MATERIAL_MISC
    if name == "Gusto's Bounty":
        item['category'] = CATEGORY_MATERIAL_MISC
    if name == "Magic's Bounty":
        item['category'] = CATEGORY_MATERIAL_MISC
    if name == "Elder Elm":
        item['category'] = CATEGORY_MATERIAL_MISC

    for material in materials:
        if material == name:
            item['category'] = CATEGORY_MATERIAL
            
    
    if not 'fertilizer_bonus' in item:
        item['fertilizer_bonus'] = dict()

    if name == 'Moonlit Stone':
        item['fertilizer_bonus']['toxicity'] = -20

    if 'fertilizer_bonus' in item and not item['fertilizer_bonus']:
        del item['fertilizer_bonus']

    
    if 'Materials' in item['category'] and item['category'] != CATEGORY_MATERIAL_MISC and not 'fertilizer_bonus' in item:
        print('hotfixMaterial: material without fertilizer_bonus: {}'.format(name))
    
    if not 'Materials' in item['category'] and 'fertilizer_bonus' in item:
        print('hotfixMaterial: fertilizer_bonus without materials category: {}, {}'.format(name, item['category']))
    
    return item

def hotfixFood(name, item):
    if not 'fertilizer_bonus' in item:
        item['fertilizer_bonus'] = dict()

    if name == 'Salt':
        item['fertilizer_bonus']['immunity'] = 10
        item['fertilizer_bonus']['herbicide'] = 10
        item['fertilizer_bonus']['pesticide'] = 10
        item['fertilizer_bonus']['toxicity'] = 5
    if name == 'Sugar':
        item['fertilizer_bonus']['stickiness_gusto'] = 5
        item['fertilizer_bonus']['toxicity'] = 1
    if name == 'Tea':
        item['fertilizer_bonus']['leaf_fertilizer'] = 5
        item['fertilizer_bonus']['herbicide'] = 1
        item['fertilizer_bonus']['pesticide'] = 1
    if name == 'Fish Mint':
        item['fertilizer_bonus']['pesticide'] = 3
    if name == 'Sesame':
        item['fertilizer_bonus']['toxicity'] = -5
    if name == 'Kombu Kelp':
        item['fertilizer_bonus']['root_fertilizer'] = 10
    if name == 'Oil':
        # no effect, not shown in Components ?
        item['fertilizer_bonus']['root_fertilizer'] = 0
        item['fertilizer_bonus']['leaf_fertilizer'] = 0
        item['fertilizer_bonus']['kernel_fertilizer'] = 0
    if name == 'Fish Oil':
        item['fertilizer_bonus']['leaf_fertilizer'] = 5
    if name == 'Vegetable Oil':
        item['fertilizer_bonus']['leaf_fertilizer'] = 5
    if name == 'Vinegar':
        item['fertilizer_bonus']['immunity'] = 1
    if name == 'Rice Bran':
        item['fertilizer_bonus']['kernel_fertilizer'] = 10
        item['fertilizer_bonus']['pesticide'] = -2
        item['fertilizer_bonus']['herbicide'] = 2
    if name == 'Spring Water':
        item['fertilizer_bonus']['toxicity'] = -5
    if name == 'Renowed Water':
        item['fertilizer_bonus']['toxicity'] = 10
    if name == 'Medicinal Base':
        item['fertilizer_bonus']['yield_hp'] = 25
        item['fertilizer_bonus']['taste_strength'] = 25
        item['fertilizer_bonus']['hardness_vitality'] = 25
        item['fertilizer_bonus']['stickiness_gusto'] = 25
        item['fertilizer_bonus']['aesthetic_luck'] = 25
        item['fertilizer_bonus']['armor_magic'] = 25


    if 'fertilizer_bonus' in item and not item['fertilizer_bonus']:
        del item['fertilizer_bonus']

    if 'fertilizer_bonus' in item and item['fertilizer_bonus']:
        item['category'] = CATEGORY_MATERIAL_FOOD
        
    for material in materials:
        if material == name:
            item['category'] = CATEGORY_MATERIAL_FOOD

    if 'Materials' in item['category'] and not 'fertilizer_bonus' in item:
        print('hotfixFood: material without fertilizer_bonus: {}'.format(name))
    
    if not 'Food' in item['category'] and 'food_bonus' in item:
        print('hotfixFood: food_bonus without food category: {}, {}'.format(name, item['category']))

    return item


def main():
    #with open('old_items.yml') as f:
    #    old_items = yaml.load(f, Loader=yaml.FullLoader)

    for item in getItemNames('Food.csv', 'Food', True):
        item_name = item['name']
        item_code = item['Code']
        if 'Insect_' in item_code:
            insects.append({ "Code": item_code, "name": item_name })
        if 'Meat_' in item_code:
            meat.append({ "Code": item_code, "name": item_name })
            meat_seafood.append({ "Code": item_code, "name": item_name })
        if 'Seafood_' in item_code:
            seafood.append({ "Code": item_code, "name": item_name })
            meat_seafood.append({ "Code": item_code, "name": item_name })
        if 'Vegetable_' in item_code:
            vegetables.append({ "Code": item_code, "name": item_name })
        if 'Grain_' in item_code:
            grains.append({ "Code": item_code, "name": item_name })
        if 'Spice_' in item_code:
            spices.append({ "Code": item_code, "name": item_name })

    enemies_map = getEnemies()
    enchants_map = getEnchant()
    worldmap_landmark_map = getWorldmapLandmarks()

    item_names = []
    for item in getItemNames('Material.csv', CATEGORY_MATERIAL, item_names):
        item_names.append(item)
    for item in getItemNames('Food.csv', CATEGORY_FOOD, item_names):
        item_names.append(item)
    for name in getItemNames('Cooking.csv', CATEGORY_COOKING, item_names):
        item_names.append(name)

    worldmap_collection_map = getWorldmapCollection(worldmap_landmark_map, item_names)

    materials_map = getMaterials(item_names, enemies_map, worldmap_collection_map)
    food_map = getFood(item_names, enchants_map, enemies_map, worldmap_collection_map)
    cooking_map = getCooking(item_names, enchants_map, food_map, worldmap_collection_map)

    items = []
    for value in materials_map.values():
        items.append(value)
    for value in food_map.values():
        items.append(value)
    for value in cooking_map.values():
        items.append(value)

    with open(r'materials.yml', 'w') as file:
        yaml.safe_dump(list(materials_map.values()), file, allow_unicode=True)
    with open(r'food.yml', 'w') as file:
        yaml.safe_dump(list(food_map.values()), file, allow_unicode=True)
    with open(r'cooking.yml', 'w') as file:
        yaml.safe_dump(list(cooking_map.values()), file, allow_unicode=True)
    with open(r'items.yml', 'w') as file:
        yaml.safe_dump(list(items), file, allow_unicode=True)
    with open(r'items.json', 'w') as file:
        json.dump(items, file, indent=4)
    with open(r'items.json', 'r') as json_file:
        with open(r'items.yml', 'w') as yaml_file:
            yaml.safe_dump(json.load(json_file), yaml_file, default_flow_style=False, allow_unicode=True)


if __name__ == "__main__":
    main()
