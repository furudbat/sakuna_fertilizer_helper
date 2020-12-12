#! /usr/bin/python

import os
import json
import yaml
import re
import io
from csv import DictReader
from pprint import pprint

def newItem(name, category):
    return {
        'name': name,
        'category': category,
        'fertilizer_bonus': {},
        'found_in': '',
        'source': '',
        'time_of_day': '',
        'used_in_recipes': ''
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

    return item


def main():
    items = {}
    items_map = {}
    materials_map = {}
    food_map = {}
    categories_set = set()
    source_set = set()

    with open('items.yml') as f:
        # use safe_load instead load
        items = yaml.safe_load(f)

    for item in items:
        items_map[item['name']] = item

    with open('Material.csv', encoding="utf8") as read_obj:
        #data = read_obj.read()
        ## csvs are a bit juncky ... '\n' is NOT the ende of the row ... "~Code" is the end of the row (but some times missing =/)
        # also add "End" at the "Header" (line 1)

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
                    new_item['category'] = 'Material'
                    new_item['sub_category'] = row['SubCategory'] if row['SubCategory'] != '-' else ''
                    new_item = setFertilizerBonus(new_item, row)
                    materials_map[name] = new_item

    with open('Food.csv', encoding="utf8") as read_obj:
        #data = read_obj.read()
        ## csvs are a bit juncky ... '\n' is NOT the ende of the row ... "~Code" is the end of the row (but some times missing =/)
        # also add "End" at the "Header" (line 1)

        food_reader = DictReader(read_obj)

        # iterate over each line as a ordered dictionary
        for row in food_reader:
            name = row['NameEn']
            if name:
                new_item = newItem(name, row['FoodFlag'])
                if name in items_map:
                    new_item = items_map[name]
                categories_set.add(row['FoodFlag'])

                if row['FoodFlag'] == 'Material' or row['FoodFlag'] == 'ManureBase' or row['FoodFlag'] == 'Bird':
                    new_item['category'] = 'Materials/Ingredients'
                else:
                    new_item['category'] = 'Ingredients'
                
                new_item['sub_category'] = row['FoodFlag'] if row['FoodFlag'] != '-' else ''
                if row['Life'].isnumeric() and int(row['Life']) != 0:
                    life = int(row['Life'])
                    new_item['life'] = life
                    if life > 0:
                        new_item['expirable'] = True
                if row['Source'] != '-':
                    source_set.add(row['Source'])
                if row['Price'].isnumeric() and int(row['Price']) != 0:
                    new_item['price'] = int(row['Price'])
                new_item = setFertilizerBonus(new_item, row)
                food_map[name] = new_item
    
    pprint(categories_set)
    pprint(source_set)

    new_items = []
    for value in materials_map.values():
        new_items.append(value)
    for value in food_map.values():
        new_items.append(value)

    with open(r'new_items.yaml', 'w') as file:
        yaml.dump(new_items, file)


if __name__ == "__main__":
    main()