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
CATEGORY_FOOD_COOKING = 'Food/Cooking'

old_items = {}


def newItem(name, category):
    return {
        'name': name,
        'category': category
    }

def equalItemByCode(it, item_code):
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
    find_item = find_item or (it['Code'] == 'PanaceaPanaceaSenshi' and 'PanaceaSenshi' in item_code)
    find_item = find_item or (it['Code'] == 'PanaceaPanaceaHohi' and 'PanaceaHohi' in item_code)
    find_item = find_item or (it['Code'] == 'Vegetable_SyungikuVegetable_Nanakusa' and ('Vegetable_Nanakusa' in item_code or 'Vegetable_Syungiku' in item_code))
    
    return find_item

def parseEnchant(enchantstr, enchants_map):
    ret = []

    find_enchant = False
    for enchant in enchants_map.values():
        enchant_code = enchant['Code']
        enchant_name = enchant['name']
        
        enchant_regex_str = "({})(\\/(\\d+))?".format(enchant_code)
        enchant_match = re.search(enchant_regex_str, enchantstr)
        enchant_level = int(enchant_match.groups()[2]) + 1 if enchant_match and enchant_match.groups()[2] and enchant_match.groups()[2].lstrip('-+').isnumeric() else 1

        if enchant_match:
            ret.append({ 'name': enchant_name, 'level': enchant_level })
            find_enchant = True

    if not find_enchant:
        print("parseEnchant: enchant not found in enchants_map: {}".format(enchantstr))
        
    if not ret:
        print("parseEnchant: not found: {}".format(enchantstr))

    return ret


def parseItemDrop(itemstr, item_names):
    ret = []

    item_codes = [itemstr]
    if '|' in itemstr:
        item_codes = itemstr.split('|')

    for item_code in item_codes:
        item_code = item_code.strip()
        item_code_match = re.search(r'(M:|F:|C:|Ex:)?(\S+)', item_code)
        item_code = item_code_match.groups()[1] if item_code_match and item_code_match.groups()[1] else item_code

        find_item=False

        for drop_item in item_names:
            if equalItemByCode(drop_item, item_code):
                ret.append({ "name": drop_item['name'], "Code": drop_item['Code'] })
                find_item = True

        if not find_item:
            print("parseItemDrop: {} item not found in item_names {}".format(item_code, itemstr))

    if len(ret) == 0:
        print("parseItemDrop: ret is empty {}".format(itemstr))
    if len(ret) != len(itemstr.split('|')):
        print("parseItemDrop: ret has only {}, str has {} items; {}".format(len(ret), len(itemstr.split('|')), itemstr))

    return ret


def parseSource(item, sourcestr, item_names, auto_name=None):
    ret = []

    sources = [sourcestr]
    if '|' in sourcestr or '&' in sourcestr:
        sources = sourcestr.split(' ')
    
    result_counter = 0

    for i in range(0, len(sources), 2):
        operator = ''
        source = ''
        item_added = False

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
            amount = int(source_match.groups()[2]) if source_match and source_match.groups()[2] and source_match.groups()[2].lstrip('-+').isnumeric() else 1

            item_code_match = re.search(r'(M:|F:|C:|Ex:)?(\S+)', item_code)
            item_code = item_code_match.groups()[1] if item_code_match and item_code_match.groups()[1] else item_code
            
            if re.findall(r'^Flag_([_.:\*A-Za-z]+)$', item_code):
                food_flag = re.search(r'^Flag_([_.:\*A-Za-z]+)$', item_code).groups()[0] if re.search(r'^Flag_([_.:\*A-Za-z]+)$', item_code) else ''
                find_items = False
                for food_item in item_names:
                    if 'sub_category' in food_item and food_item['sub_category']:
                        if food_flag == food_item['sub_category'] or (food_flag == 'Syouchu' and food_item['sub_category'] == 'SakeSyouchu'):
                            item_name = food_item['name']
                            if item_name:
                                ret.append({"name": item_name, "amount": amount, "operator": "or"})
                                find_items = True
                                item_added = True
                if find_items:
                    ret[-1]['operator'] = ''
                else:
                    pprint(ret)
                    print("parseSource: flag {} not found, {}: {}".format(food_flag, item['name'], sourcestr))
            elif item_code == '*Auto':
                if auto_name:
                    ret.append({"name": auto_name, "amount": amount, "operator": operator})
                    item_added = True
                else:
                    print("warn: auto is None but '*Auto' was found in {}".format(sourcestr))
            elif item_code == '*Ex:Saiken':
                # TODO: what is Ex:Saiken ???
                ret.append({"name": 'Saiken ???', "amount": amount, "operator": operator})
                item_added = True
            elif item_code == 'Meat':
                for meat_item in meat:
                    if meat_item['name']:
                        ret.append({"name": meat_item['name'], "amount": amount, "operator": "or"})
                        item_added = True
                ret[-1]['operator'] = ''
            elif item_code == 'Vegetable':
                for vegetable_item in vegetables:
                    if vegetable_item['name']:
                        ret.append({"name": vegetable_item['name'], "amount": amount, "operator": "or"})
                        item_added = True
                ret[-1]['operator'] = ''
            elif item_code == 'Seafood':
                for seafood_item in seafood:
                    if seafood_item['name']:
                        ret.append({"name": seafood_item['name'], "amount": amount, "operator": "or"})
                        item_added = True
                ret[-1]['operator'] = ''
            elif item_code == 'Grain':
                for grain_item in grains:
                    if grain_item['name']:
                        ret.append({"name": grain_item['name'], "amount": amount, "operator": "or"})
                        item_added = True
                ret[-1]['operator'] = ''
            elif item_code == 'Insect':
                for insect_item in insects:
                    if insect_item['name']:
                        ret.append({"name": insect_item['name'], "amount": amount, "operator": "or"})
                        item_added = True
                ret[-1]['operator'] = ''
            elif item_code == 'Spice':
                for spice_item in spices:
                    if spice_item['name']:
                        ret.append({"name": spice_item['name'], "amount": amount, "operator": "or"})
                        item_added = True
                ret[-1]['operator'] = ''
            else:
                for it in item_names:
                    if equalItemByCode(it, item_code):
                        item_name = it['name']
                        if item_name:
                            ret.append({"name": item_name, "amount": amount, "operator": operator})
                            item_added = True
                            break

            if not item_added:
                pprint(ret)
                print("parseSource: {} not found, {}: {}".format(item_code, item['name'], sourcestr))

            result_counter = result_counter + 1

    if len(ret) == 0:
        print("parseSource: {} ret is empty {}".format(item['name'], sourcestr))

    if '|' in sourcestr or '&' in sourcestr:
        sources = re.split(r'&|\|', sourcestr)
        if result_counter != len(sources):
            print("parseSource: ret has only {}, str has {} items; {}".format(len(ret), len(sources), sourcestr))
    
    return ret


def setFertilizerBonusValue(item, row, col_name, property_name):
    if col_name in row and row[col_name] != '-' and row[col_name].lstrip('-+').isnumeric():
        value = int(row[col_name])
        if value != 0:
            if property_name in item['fertilizer_bonus']:
                item['fertilizer_bonus'][property_name] = item['fertilizer_bonus'][property_name] + value
            else:
                item['fertilizer_bonus'][property_name] = value

def setFoodBonusValue(item, row, food_bonus_name, col_name, property_name):
    if col_name in row and row[col_name] != '-' and row[col_name].lstrip('-+').isnumeric():
        value = int(row[col_name])
        if value != 0:
            if property_name in item[food_bonus_name]:
                item[food_bonus_name][property_name] = item[food_bonus_name][property_name] + value
            else:
                item[food_bonus_name][property_name] = value
    elif col_name in row and row[col_name] == '*100':
        if property_name in item[food_bonus_name]:
            item[food_bonus_name][property_name] = item[food_bonus_name][property_name] * 100
        else:
            item[food_bonus_name][property_name] = 100

def setFoodBonusEnchant(item, row, food_bonus_name, col_name, enchants_map):
    if col_name in row and row[col_name] and row[col_name] != '-':
        if not 'enchant' in item[food_bonus_name]:
            item[food_bonus_name]['enchant'] = []
        for enchant in parseEnchant(row[col_name], enchants_map):
            if not next((en for en in item[food_bonus_name]['enchant'] if en['name'] == enchant['name']), None):
                item[food_bonus_name]['enchant'].append(enchant)
            else:
                for i in range(len(item[food_bonus_name]['enchant'])):
                    if item[food_bonus_name]['enchant'][i]['name'] == enchant['name']:
                        item[food_bonus_name]['enchant'][i]['level'] = item[food_bonus_name]['enchant'][i]['level'] + enchant['level']

    if food_bonus_name in item and 'enchant' in item[food_bonus_name] and not item[food_bonus_name]['enchant']:
        del item[food_bonus_name]['enchant']

def setFertilizerBonus(item, row):
    if not 'fertilizer_bonus' in item:
        item['fertilizer_bonus'] = dict()
    
    setFertilizerBonusValue(item, row, 'Mnr_Ne', 'root_fertilizer')
    setFertilizerBonusValue(item, row, 'Mnr_Ho', 'kernel_fertilizer')
    setFertilizerBonusValue(item, row, 'Mnr_Ha', 'leaf_fertilizer')

    setFertilizerBonusValue(item, row, 'Mnr_Yield', 'yield_hp')
    setFertilizerBonusValue(item, row, 'Mnr_Taste', 'taste_strength')
    setFertilizerBonusValue(item, row, 'Mnr_Hardness', 'hardness_vitality')
    setFertilizerBonusValue(item, row, 'Mnr_Viscose', 'stickiness_gusto')
    setFertilizerBonusValue(item, row, 'Mnr_Appearance', 'aesthetic_luck')
    setFertilizerBonusValue(item, row, 'Mnr_Fragrance', 'armor_magic')

    setFertilizerBonusValue(item, row, 'Mnr_Immunity', 'immunity')
    setFertilizerBonusValue(item, row, 'Mnr_Herbicide', 'herbicide')
    setFertilizerBonusValue(item, row, 'Mnr_Pesticide', 'pesticide')
    setFertilizerBonusValue(item, row, 'Mnr_Toxic', 'toxicity')

    return item

def setFoodBonus(item, row, enchants_map):
    if not 'food_bonus' in item:
        item['food_bonus'] = dict()

    setFoodBonusValue(item, row, 'food_bonus', 'BuffHpMax', 'hp')
    setFoodBonusValue(item, row, 'food_bonus', 'BuffWpMax', 'sp')
    setFoodBonusValue(item, row, 'food_bonus', 'BuffStrength', 'strength')
    setFoodBonusValue(item, row, 'food_bonus', 'BuffVital', 'vitality')
    setFoodBonusValue(item, row, 'food_bonus', 'BuffMagic', 'magic')
    setFoodBonusValue(item, row, 'food_bonus', 'BuffLuck', 'luck')
    setFoodBonusValue(item, row, 'food_bonus', 'BuffHungry', 'fullness')

    setFoodBonusEnchant(item, row, 'food_bonus', 'BuffEnchant', enchants_map)

    return item

def setFoodBonusFromCooking(item, row, enchants_map):
    if row['SeasonBuff'] and row['SeasonBuff'] != '-':
        item['season_buff'] = row['SeasonBuff']
        item['season_food_bonus'] = dict()

        setFoodBonusValue(item, row, 'season_food_bonus', 'SeasonBuffHpMax', 'hp')
        setFoodBonusValue(item, row, 'season_food_bonus', 'SeasonBuffWpMax', 'sp')
        setFoodBonusValue(item, row, 'season_food_bonus', 'SeasonBuffStrength', 'strength')
        setFoodBonusValue(item, row, 'season_food_bonus', 'SeasonBuffVital', 'vitality')
        setFoodBonusValue(item, row, 'season_food_bonus', 'SeasonBuffMagic', 'magic')
        setFoodBonusValue(item, row, 'season_food_bonus', 'SeasonBuffLuck', 'luck')
        setFoodBonusValue(item, row, 'season_food_bonus', 'SeasonBuffHungry', 'fullness')

        setFoodBonusEnchant(item, row, 'season_food_bonus', 'SeasonBuffEnchant', enchants_map)
            
    return item

def setFoodWhenSpoiled(item, row, item_names):
    if row['LostGenerate'] and row['LostGenerate'] != '-':
        when_spoiled = parseLostGenerate(row['LostGenerate'], item_names)
        if when_spoiled:
            item['when_spoiled'] = when_spoiled['name']

    return item

def setCollectionDrops(item, item_code, worldmap_collection_map):
    if not 'find_in' in item:
        item['find_in'] = []
    
    for collection in worldmap_collection_map.values():
        if 'always' in collection:
            for drop in collection['always']:
                if equalItemByCode(drop, item_code):
                    new_find_in = { 'name': collection['name'], 'percent': drop['percent'], 'season': 'Always' }
                    if 'try' in collection:
                        new_find_in['try'] = collection['try']
                    if not next((col for col in item['find_in'] if col['name'] == new_find_in['name'] and col['season'] == new_find_in['season']), None):
                        item['find_in'].append(new_find_in)
        if 'spring' in collection:
            for drop in collection['spring']:
                if equalItemByCode(drop, item_code):
                    new_find_in = { 'name': collection['name'], 'percent': drop['percent'], 'season': 'Spring' }
                    if 'try' in collection:
                        new_find_in['try'] = collection['try']
                    if not next((col for col in item['find_in'] if col['name'] == new_find_in['name'] and col['season'] == new_find_in['season']), None):
                        item['find_in'].append(new_find_in)
        if 'summer' in collection:
            for drop in collection['summer']:
                if equalItemByCode(drop, item_code):
                    new_find_in = { 'name': collection['name'], 'percent': drop['percent'], 'season': 'Summer' }
                    if 'try' in collection:
                        new_find_in['try'] = collection['try']
                    if not next((col for col in item['find_in'] if col['name'] == new_find_in['name'] and col['season'] == new_find_in['season']), None):
                        item['find_in'].append(new_find_in)
        if 'autumn' in collection:
            for drop in collection['autumn']:
                if equalItemByCode(drop, item_code):
                    new_find_in = { 'name': collection['name'], 'percent': drop['percent'], 'season': 'Autumn' }
                    if 'try' in collection:
                        new_find_in['try'] = collection['try']
                    if not next((col for col in item['find_in'] if col['name'] == new_find_in['name'] and col['season'] == new_find_in['season']), None):
                        item['find_in'].append(new_find_in)
        if 'winter' in collection:
            for drop in collection['winter']:
                if equalItemByCode(drop, item_code):
                    new_find_in = { 'name': collection['name'], 'percent': drop['percent'], 'season': 'Winter' }
                    if 'try' in collection:
                        new_find_in['try'] = collection['try']
                    if not next((col for col in item['find_in'] if col['name'] == new_find_in['name'] and col['season'] == new_find_in['season']), None):
                        item['find_in'].append(new_find_in)

    if len(item['find_in']) == 0:
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

def getItemNames(filename, category, item_names, enchants_map, worldmap_collection_map, only_names=False):
    ret = []
    if filename == 'Material.csv' and not only_names:
        ret = getMaterials(item_names, worldmap_collection_map, True).values()
    elif filename == 'Food.csv' and not only_names:
        ret = getFood(item_names, enchants_map, worldmap_collection_map, True).values()
    elif filename == 'Cooking.csv' and not only_names:
        ret = getCooking(item_names, enchants_map, worldmap_collection_map, {}, True).values()
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

def getMaterials(item_names, worldmap_collection_map, only_name=False):
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
                    for it in item_names:
                        if equalItemByCode(it, item_code):
                            new_item = it.copy()
                    
                    new_item['description'] = row['CommentEn'].replace('\\1', ', ')

                    new_item = setFertilizerBonus(new_item, row)

                    new_item = hotfixMaterial(name, new_item)

                materials_map[item_code] = new_item

    return materials_map

def setFoodAttrs(item, row, item_names, auto_name):
    if row['Life'].lstrip('-+').isnumeric():
        life = int(row['Life'])
        if life != 0:
            item['life'] = life
            if life > 0:
                item['expiable'] = True
    
    if row['Price'].lstrip('-+').isnumeric() and int(row['Price']) != 0:
        item['price'] = int(row['Price'])

    item['description'] = row['CommentEn'].replace('~Auto~', auto_name).replace('\\1', ', ').replace(',  ', ', ').replace('\n', ' ')
    
    if row['Source'] != '-' and not 'ingredients' in item:
        item['ingredients'] = parseSource(item, row['Source'], item_names, auto_name)
    #elif 'ingredients' in item:
    #    pprint(item['ingredients'])
    #    print('getFood: already had ingredients: {}'.format(item['name']))

    return item

def getFood(item_names, enchants_map, worldmap_collection_map, only_name=False):
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
                    for it in food_map:
                        if name == it['name']:
                            new_item = it.copy()
                    
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
                        auto_name = auto['name']
                        auto_code = auto['Code']

                        name = new_item['name'].replace('~Auto~', auto_name)
                        new_food_item = new_item.copy()

                        new_food_item['name'] = name
                        
                        item_code = row['Code']
                        if '_*Meat|Seafood' in row['Code']:
                            item_code = row['Code'].replace('*Meat|Seafood', auto_code)
                        elif '_*Seafood' in row['Code']:
                            item_code = row['Code'].replace('*Seafood', auto_code)
                        elif '_*Meat' in row['Code']:
                            item_code = row['Code'].replace('*Meat', auto_code)
                        elif '_*Vegetable' in row['Code']:
                            item_code = row['Code'].replace('*Vegetable', auto_code)
                        elif '_*Grain' in row['Code']:
                            item_code = row['Code'].replace('*Grain', auto_code)
                        elif '_*Insect' in row['Code']:
                            item_code = row['Code'].replace('*Insect', auto_code)

                        if only_name:
                            new_food_item['Code'] = item_code
                        else:
                            new_food_item = setFoodAttrs(new_food_item, row, item_names, auto_name)

                            new_food_item = setFertilizerBonus(new_food_item, row)
                            new_food_item = setFoodBonus(new_food_item, row, enchants_map)
                            new_food_item = setCollectionDrops(new_food_item, item_code, worldmap_collection_map)
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

                        new_item = setFoodAttrs(new_item, row, item_names, name)

                        new_item = setFertilizerBonus(new_item, row)
                        new_item = setFoodBonus(new_item, row, enchants_map)
                        new_item = setCollectionDrops(new_item, item_code, worldmap_collection_map)
                        new_item = setFoodWhenSpoiled(new_item, row, item_names)

                        hotfixFood(new_item['name'], new_item)
                    
                    food_map[item_code] = new_item

    return food_map

def getCooking(item_names, enchants_map, worldmap_collection_map, food_map, only_names=False):
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
                for it in item_names:
                    if name == it['name']:
                        new_item = it.copy()
                        new_item['category'] = CATEGORY_COOKING
                    
                main_sources = [{'name': name}]
                if '~SourceMain~' in name and row['SourceMain'] != '-':
                    source_main = parseSource(new_item, row['SourceMain'], item_names)
                    main_sources = []
                    for sm in source_main:
                        main_sources.append({ 'name': sm['name'], 'source_main': sm })
                elif '~SourceMain~' in name:
                    print('getCooking: "~SourceMain~" in name found, but no SourceMain in row')

                for main_source in main_sources:
                    source_name = main_source['name']

                    food_item = None
                    new_food_item = new_item.copy()
                    for it in food_map.values():
                        if name == it['name']:
                            food_item = it.copy()
                            new_food_item = it.copy()
                            new_food_item['category'] = CATEGORY_FOOD_COOKING
                    
                    new_food_item['name'] = row['NameEn'].replace('~SourceMain~', source_name)

                    if only_names:
                        new_food_item['Code'] = row['Code']
                    else:
                        new_food_item['description'] = row['CommentEn'].replace('\\1', ',').replace('~SourceMain~', source_name)

                        if 'source_main' in main_source:
                            new_food_item['main_ingredient'] = main_source['source_main']
                        
                        if row['Source'] != '-':
                            source = parseSource(new_food_item, row['Source'], item_names)
                            if source:
                                if not 'ingredients' in new_food_item:
                                    new_food_item['ingredients'] = source
                                elif 'ingredients' in new_food_item:
                                    if food_item and not (len(source) == 1 and food_item['name'] == source[0]['name']):
                                        new_food_item['ingredients'] = source
                                    #elif 'ingredients' in new_food_item and len(source) == 1 and food_item['name'] == source[0]['name']:
                                    #    pprint(new_food_item)
                                    #    print('getCooking: ingredients already in item: {}'.format(new_food_item['name']))

                        
                        new_food_item = setFoodBonus(new_food_item, row, enchants_map)
                        new_food_item = setFoodBonusFromCooking(new_food_item, row, enchants_map)

                        new_food_item = hotfixCooking(new_food_item['name'], new_food_item)

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
            name = row['Name']
            
            enemy = { 
                "name": name,
                "Code": code,
                "min_level": int(row['LevelMin']) if row['LevelMin'].lstrip('-+').isnumeric() else 0,
                "max_level": int(row['LevelMax']) if row['LevelMax'].lstrip('-+').isnumeric() else 0,
                "Item": row['Item'],
                "time_of_day": row['Time']
            }

            hotfixEnemy(name, enemy)

            if not code in enemies_map:
                enemies_map[code] = []

            enemies_map[code].append(enemy)

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

            if equalItemByCode(item, lost_item_code):
                return { 'name': item_name, 'Code': item_code }
    
    print("parseLostGenerate: {} not found: {}".format(lost_item_code, itemstr))

    return None


def parseWorldmapCollectionItem(itemsstr, item_names):
    ret = []

    for itemstr in itemsstr.split('|'):
        collection_item_match = re.search(r'(M:|F:|C:|Ex:)?(\S+) (\d+)', itemstr)
        collection_item_code = collection_item_match.groups()[1] if collection_item_match and collection_item_match.groups()[1] else ''
        collection_item_percent = int(collection_item_match.groups()[2]) if collection_item_match and collection_item_match.groups()[2] and collection_item_match.groups()[2].lstrip('-+').isnumeric() else 1

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
            if code and name:
                collection = { "name": name, "Code": code }
                
                if row['Try'].lstrip('-+').isnumeric() and int(row['Try']) != 0:
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
            else:
                print('getWorldmapCollection: {} place not found: {}'.format(code, name))

    return worldmap_collection_map



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

def hotfixCooking(name, item):
    if 'fertilizer_bonus' in item and item['fertilizer_bonus']:
        item['category'] = CATEGORY_MATERIAL_COOKING
        
    for material in materials:
        if material == name:
            item['category'] = CATEGORY_MATERIAL_COOKING

    if 'RiceStaple_' in name:
        item['sub_category'] = 'Main Dish'
    elif 'SoupStaple_' in name:
        item['sub_category'] = 'Soup'
    elif 'NoodleStaple_' in name:
        item['sub_category'] = 'Main Dish'
    elif 'SoftStaple_' in name:
        item['sub_category'] = 'Main Dish'
    elif 'HardMainDish_' in name:
        item['sub_category'] = 'Main Dish'
    elif 'SoupSoup_' in name:
        item['sub_category'] = 'Soup'
    elif 'SoftSoup_' in name:
        item['sub_category'] = 'Soup'
    elif 'HardSoup_' in name:
        item['sub_category'] = 'Soup'
    elif 'SoftMainDish_' in name:
        item['sub_category'] = 'Side Dish'
    elif 'Sweets_' in name:
        item['sub_category'] = 'Dessert'
    elif 'Drink_' in name:
        item['sub_category'] = 'Drink'

    if 'food_bonus' in item and not item['food_bonus']:
        del item['food_bonus']
        
    if 'season_food_bonus' in item and not item['season_food_bonus']:
        del item['season_food_bonus']
        
    if 'ingredients' in item and not item['ingredients']:
        del item['ingredients']

    if 'Cooking' in item['category'] and (not 'main_ingredient' in item and not 'ingredients' in item) and item['name'] != 'Water':
        print('hotfixFood: cooking without ingredients: {}'.format(name))
    
    if not 'Cooking' in item['category'] and ('main_ingredient' in item or 'ingredients' in item):
        print('hotfixFood: ingredients without cooking category: {}, {}'.format(name, item['category']))

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
        
    if 'food_bonus' in item and not item['food_bonus']:
        del item['food_bonus']

    if 'season_food_bonus' in item and not item['season_food_bonus']:
        del item['season_food_bonus']

    if 'ingredients' in item and not item['ingredients']:
        del item['ingredients']
    
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


def hotfixEnemy(name, enemy):
    if enemy['Code'] == 'Usagi':
        enemy['name'] = 'Rabbit'
    if enemy['Code'] == 'Buta':
        enemy['name'] = 'Pig'
    if enemy['Code'] == 'Shishi':
        enemy['name'] = 'Boar'
    if enemy['Code'] == 'Shika':
        enemy['name'] = 'Deer'
    if enemy['Code'] == 'Kuma':
        enemy['name'] = 'Bear'
    if enemy['Code'] == 'Mujina':
        enemy['name'] = 'Badger'
    if enemy['Code'] == 'Suppon':
        enemy['name'] = 'Turtle'
    if enemy['Code'] == 'Suzume':
        enemy['name'] = 'Sparrow'
    if enemy['Code'] == 'Kiji':
        enemy['name'] = 'Pheasant'

    return enemy

def main():
    #with open('old_items.yml') as f:
    #    old_items = yaml.load(f, Loader=yaml.FullLoader)

    enemies_map = getEnemies()
    enchants_map = getEnchant()
    worldmap_landmark_map = getWorldmapLandmarks()

    for item in getItemNames('Food.csv', 'Food', [], enchants_map, {}, True):
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

    item_names = []
    for item in getItemNames('Material.csv', CATEGORY_MATERIAL, item_names, enchants_map, {}):
        item_names.append(item)
    for item in getItemNames('Food.csv', CATEGORY_FOOD, item_names, enchants_map, {}):
        item_names.append(item)
    for name in getItemNames('Cooking.csv', CATEGORY_COOKING, item_names, enchants_map, {}):
        item_names.append(name)

    worldmap_collection_map = getWorldmapCollection(worldmap_landmark_map, item_names)
        
    with open(r'enemies.json', 'w') as file:
        json.dump(enemies_map, file, indent=4)

    # set enemy drops
    for item in item_names:
        item_code = item['Code']
        for enemy in enemies_map.values():
            for enemy_drop in enemy:
                if enemy_drop['Item'] and enemy_drop['Item'] != '-':
                    for drop in parseItemDrop(enemy_drop['Item'], item_names):
                        if equalItemByCode(drop, item_code):
                            if not 'enemy_drops' in item:
                                item['enemy_drops'] = []
                            if not next((e for e in item['enemy_drops'] if e['name'] == enemy_drop['name'] and e['time'] == enemy_drop['time_of_day']), None):
                                item['enemy_drops'].append({ 'name': enemy_drop['name'], 'time': enemy_drop['time_of_day'] })
                else:
                    print('no item set by enemy {}', enemy_drop['Code'])


    with open(r'item_names.json', 'w') as file:
        json.dump(item_names, file, indent=4)

    materials_map = getMaterials(item_names, worldmap_collection_map)
    food_map = getFood(item_names, enchants_map, worldmap_collection_map)
    cooking_map = getCooking(item_names, enchants_map, worldmap_collection_map, food_map)

    items = []
    for value in materials_map.values():
        if 'Code' in value:
            del value['Code']
        items.append(value)
    for value in food_map.values():
        if 'Code' in value:
            del value['Code']
        items.append(value)
    for value in cooking_map.values():
        if 'Code' in value:
            del value['Code']
        items.append(value)

    with open(r'materials.yml', 'w') as file:
        yaml.safe_dump(list(materials_map.values()), file, allow_unicode=True)
    with open(r'food.yml', 'w') as file:
        yaml.safe_dump(list(food_map.values()), file, allow_unicode=True)
    with open(r'cooking.yml', 'w') as file:
        yaml.safe_dump(list(cooking_map.values()), file, allow_unicode=True)
    with open(r'items.json', 'w') as file:
        json.dump(items, file, indent=4)

    # fix yaml ouput 
    #with open(r'items.yml', 'w') as file:
    #    yaml.safe_dump(list(items), file, allow_unicode=True)
    with open(r'items.json', 'r') as json_file:
        with open(r'items.yml', 'w') as yaml_file:
            yaml.safe_dump(json.load(json_file), yaml_file, default_flow_style=False, allow_unicode=True)


if __name__ == "__main__":
    main()
