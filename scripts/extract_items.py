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
    'Vinegar',
    'Rice Bran',
    'Spring Water',
    'Renowed Water',
    'Medicinal Base'
]

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

    if 'food_bonus' in item and 'enchant' in item['food_bonus'] and not item['food_bonus']['enchant']:
        del item['food_bonus']['enchant']
        
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

        if 'season_bonus' in item and 'enchant' in item['season_bonus'] and not item['season_bonus']['enchant']:
            del item['season_bonus']['enchant']

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


def setFoodCategory(item, row):
    name = item['name']
    if 'FoodFlag' in row and (row['FoodFlag'] == 'Material' or row['FoodFlag'] == 'ManureBase' or row['FoodFlag'] == 'Bird' or ' Powder' in name or ' Flakes' in name):
        item['category'] = 'Material/Food'
        item['sub_category'] = row['FoodFlag'] if row['FoodFlag'] != '-' else ''
    elif 'FoodFlag' in row:
        item['category'] = 'Food'
        item['sub_category'] = row['FoodFlag'] if row['FoodFlag'] != '-' else ''
    else:
        for it in meat_seafood:
            if item['name'] == it['name']:
                item['category'] = 'Material/Food'
                item['sub_category'] = row['FoodFlag'] if row['FoodFlag'] != '-' else ''
        for it in insects:
            if item['name'] == it['name']:
                item['category'] = 'Material/Food'
                item['sub_category'] = row['FoodFlag'] if row['FoodFlag'] != '-' else ''
        for it in grains:
            if item['name'] == it['name'] and not 'Rice' in item['name']:
                item['category'] = 'Material/Food'
                item['sub_category'] = row['FoodFlag'] if row['FoodFlag'] != '-' else ''

    return item

def getItemNames(filename, category, item_names, enemies_map, enchants_map, only_names=False):
    ret = []
    if filename == 'Material.csv' and not only_names:
        ret = getMaterials(item_names, enemies_map, True).values()
    elif filename == 'Food.csv' and not only_names:
        ret = getFood(item_names, enchants_map, True).values()
    elif filename == 'Cooking.csv' and not only_names:
        ret = getCooking(item_names, enchants_map, {}, True).values()
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
                        item['category'] = 'Material'
                        item['sub_category'] = row['SubCategory'] if row['SubCategory'] != '-' else ''
                    else:
                        setFoodCategory(item, row)

                    ret.append(item)
    
    return ret

def getMaterials(item_names, enemies_map, only_name=False):
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
                    new_item['category'] = 'Material'
                    if row['SubCategory'] != '-':
                        new_item['sub_category'] = row['SubCategory']
                elif row['SubCategory'] != '':
                    new_item['category'] = row['SubCategory']

                item_code = row['Code']
                if only_name:
                    new_item['Code'] = item_code
                else:
                    new_item['description'] = row['CommentEn'].replace('\\1', ', ')

                    setFertilizerBonus(new_item, row)
                    hotfixMaterial(name, new_item)
                    setEnemyDrops(new_item, item_code, item_names, enemies_map)

                materials_map[item_code] = new_item

    return materials_map


def getFood(item_names, enchants_map, only_name=False):
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
                
                setFoodCategory(new_item, row)

                if not only_name:
                    new_item['description'] = row['CommentEn'].replace('\\1', ',').replace('\n', '')

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
                            
                            hotfixFood(name, new_food_item)

                            if row['Source'] != '-':
                                new_food_item['ingredients'] = parseSource(new_food_item, row['Source'], item_names, auto['name'])
                            
                        food_map[item_code] = new_food_item
                else:
                    item_code = row['Code']
                    if only_name:
                        new_item['Code'] = item_code
                    else:
                        hotfixFood(name, new_item)

                        if row['Source'] != '-':
                            new_item['ingredients'] = parseSource(new_item, row['Source'], item_names, name)
                    
                    food_map[item_code] = new_item

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

def getCooking(item_names, enchants_map, food_map, only_names=False):
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
                    if name == it['name']:
                        new_item = it.copy()
                for it in food_map.values():
                    if name == it['name']:
                        new_item = it.copy()
                    
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
                            if source and not 'main_ingredients' in new_food_item:
                                new_food_item['main_ingredients'] = source_main
                        
                        if row['Source'] != '-':
                            source = parseSource(new_food_item, row['Source'], item_names)
                            if source and not 'ingredients' in new_food_item:
                                new_food_item['ingredients'] = source

                        setFoodBonus(new_food_item, row, enchants_map)
                        setFoodBonusFromCooking(new_food_item, row, enchants_map)
                        hotfixCooking(name, new_food_item)

                    cooking_map[name] = new_food_item

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

    for item in getItemNames('Food.csv', 'Food', {}, {}, {}, True):
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

    item_names = []
    for item in getItemNames('Material.csv', 'Materials', item_names, enemies_map, enchants_map):
        item_names.append(item)
    for item in getItemNames('Food.csv', 'Food', item_names, enemies_map, enchants_map):
        item_names.append(item)
    for name in getItemNames('Cooking.csv', 'Cooking', item_names, enemies_map, enchants_map):
        item_names.append(name)

    materials_map = getMaterials(item_names, enemies_map)
    food_map = getFood(item_names, enchants_map)
    cooking_map = getCooking(item_names, enchants_map, food_map)

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
    with open(r'items.json', 'w') as file:
        json.dump(items, file, indent=4)


if __name__ == "__main__":
    main()
