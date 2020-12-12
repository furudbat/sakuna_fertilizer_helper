#! /usr/bin/python

import os
import json
import urllib.request
from pprint import pprint
import pandas as pd
import re

# -----------------------------------------------------------------------------
# Name:        html_table_parser
# Purpose:     Simple class for parsing an (x)html string to extract tables.
#              Written in python3
#
# Author:      Josua Schmid
#
# Created:     05.03.2014
# Copyright:   (c) Josua Schmid 2014
# Licence:     AGPLv3
# -----------------------------------------------------------------------------

from html.parser import HTMLParser


class HTMLTableParser(HTMLParser):
    """ This class serves as a html table parser. It is able to parse multiple
    tables which you feed in. You can access the result per .tables field.
    """
    def __init__(
        self,
        decode_html_entities=False,
        data_separator=' ',
        base_url=''
    ):

        HTMLParser.__init__(self, convert_charrefs=decode_html_entities)

        self._data_separator = data_separator
        self._base_url = base_url

        self._in_table = False
        self._in_td = False
        self._in_th = False
        self._in_a = False
        self._in_h2 = False
        self._in_h2_span = False
        self._in_h3 = False
        self._in_h3_span = False
        self._current_table = []
        self._current_row = []
        self._current_cell = []
        self._current_href = ''
        self._current_category = ''
        self._current_description = ''
        self.tables = []

    def handle_starttag(self, tag, attrs):
        """ We need to remember the opening point for the content of interest.
        The other tags (<table>, <tr>) are only handled at the closing point.
        """
        if tag == 'table':
            self._in_table = True
        if tag == 'td':
            self._in_td = True
        if tag == 'th':
            self._in_th = True
        if tag == 'h2':
            self._in_h2 = True
        if tag == 'h3':
            self._in_h3 = True
        if self._in_h2 and tag == 'span':
            for name, value in attrs:
                if name == "class" and value.startswith("mw-headline"):
                    self._in_h2_span = True
        if self._in_h3 and tag == 'span':
            for name, value in attrs:
                if name == "class" and value.startswith("mw-headline"):
                    self._in_h3_span = True
        if tag == 'a':
            self._in_a = True
            for name, link in attrs:
                if name == "href" and link.startswith("http"):
                    self._current_href = link
                elif name == "href":
                    self._current_href = self._base_url + link

    def handle_data(self, data):
        """ This is where we save content to a cell """
        if (self._in_h2_span):
            self._current_category = data.strip()
        if (self._in_h3_span):
            self._current_description = data.strip()
        if (self._in_td or self._in_th):
            if self._in_a:
                self._current_cell.append({
                    'link': self._current_href,
                    'value': data.strip()
                })
            else:
                self._current_cell.append(data.strip())
    
    def handle_endtag(self, tag):
        """ Here we exit the tags. If the closing tag is </tr>, we know that we
        can save our currently parsed cells to the current table as a row and
        prepare for a new row. If the closing tag is </table>, we save the
        current table and prepare for a new one.
        """

        if (self._in_td or self._in_th) and tag == 'a' and self._current_href:
            final_cell = self._current_cell[0]
            self._current_row.append(final_cell)
            self._current_cell = []
        elif tag in ['td', 'th']:
            final_cell = self._current_cell[0]
            self._current_row.append(final_cell)
            self._current_cell = []
        elif tag == 'tr':
            self._current_row.append(self._current_category)
            self._current_row.append(self._current_description)
            self._current_table.append(self._current_row)
            self._current_row = []
        elif tag == 'table':
            self.tables.append(self._current_table)
            self._current_table = []
            
        if tag == 'td':
            self._in_td = False
        elif tag == 'th':
            self._in_th = False
        elif tag == 'a':
            self._in_a = False
        elif tag == 'h2':
            self._in_h2 = False
            self._in_h2_span = False
        elif tag == 'h3':
            self._in_h3 = False
            self._in_h3_span = False
        elif tag == 'h2' or tag == 'span':
            self._in_h2_span = False
        elif tag == 'h3' or tag == 'span':
            self._in_h3_span = False

def url_get_contents(url):
    """ Opens a website and read its binary contents (HTTP Response Body) """
    req = urllib.request.Request(url=url)
    f = urllib.request.urlopen(req)
    return f.read()

def str_to_int(s):
    if s == '':
        return 0
    return int(s)

def get_bonuses(value, bonis, buffs={}):
    ret={}

    for name,rgx in bonis.items():
        if re.search(rgx, value, re.MULTILINE):
            ret[name] = str_to_int(re.findall(rgx, value, re.MULTILINE)[0])

    for name,rgx in buffs.items():
        if re.search(rgx, value, re.MULTILINE):
            ret[name] = str_to_int(re.findall(rgx, value, re.MULTILINE)[0])

    return ret

def main():
    url='https://strategywiki.org/wiki/Sakuna:_Of_Rice_and_Ruin/Items'
    xitems = url_get_contents(url).decode('utf-8')

    pitems = HTMLTableParser(base_url='https://strategywiki.org')
    pitems.feed(xitems)

    items = []
    fertilizer_bonuses = set()
    food_bonuses = set()

    for items_table in pitems.tables:
        for items_cell in items_table:
            if not items_cell[0].startswith('Icon') or not items_cell[1].startswith('Item Name'):
                if items_cell[1]['link'] and items_cell[1]['link'].find('redlink=1') < 0:
                    print('get {} ...'.format(items_cell[1]['link']))
                    xitem = url_get_contents(items_cell[1]['link']).decode('utf-8')
                    xitem = xitem.replace('<br>', '\n')
                    xitem = xitem.replace('<br/>', '\n')
                    xitem = xitem.replace('<br />', '\n')
                    xitem = xitem.replace('</br>', '\n')
                    pitem = HTMLTableParser(base_url='https://strategywiki.org')
                    pitem.feed(xitem)

                    name = pitem.tables[0][0][0]
                    item = {
                        'name': name,
                        'category': items_cell[3]
                    }
                    for item_cell in pitem.tables[0]:
                        if len(item_cell) > 2:
                            if item_cell[0].startswith('Found in'):
                                item['found_in'] = item_cell[1]
                            elif item_cell[0].startswith('Source'):
                                item['source'] = item_cell[1]
                            elif item_cell[0].startswith('Time of Day'):
                                item['time_of_day'] = item_cell[1]
                            elif item_cell[0].startswith('Fertilizer Bonus'):
                                fertilizer_bonus = get_bonuses(item_cell[1], {
                                    'leaf_fertilizer':  r'Leaf Fertilizer\s+(\+?-?\d+)%?',
                                    'kernel_fertilizer': r'Kernel Fertilizer\s+(\+?-?\d+)%?',
                                    'root_fertilizer': r'Root Fertilizer\s+(\+?-?\d+)%?',

                                    'yield_hp':  r'Yield/HP\s+(\+?-?\d+)',
                                    'taste_strength':  r'Taste/Strength\s+(\+?-?\d+)',
                                    'hardness_vitality':  r'Hardness/Vitality\s+(\+?-?\d+)',
                                    'stickiness_gusto':  r'Stickiness/Gusto\s+(\+?-?\d+)',
                                    'aesthetic_luck':  r'Aesthetic/Luck\s+(\+?-?\d+)',
                                    'armor_magic':  r'Aroma/Magic\s+(\+?-?\d+)',

                                    'immunity':  r'Immunity\s+(\+?-?\d+)',
                                    'pesticide':  r'Pesticide\s+(\+?-?\d+)',
                                    'herbicide':  r'Herbicide\s+(\+?-?\d+)',

                                    'toxicity':  r'Toxicity\s+(\+?-?\d+)',
                                })
                                fertilizer_bonuses.update(item_cell[1].split('\n'))
                                item['fertilizer_bonus'] = fertilizer_bonus
                            elif item_cell[0].startswith('Food Bonus'):
                                food_bonus = get_bonuses(item_cell[1], {
                                    'hp': r'HP\s+(\+?-?\d+)',
                                    'sp': r'SP\s+(\+?-?\d+)',
                                    'strength': r'Strength\s+(\+?-?\d+)',
                                    'vitality': r'Vitality\s+(\+?-?\d+)',
                                    'magic': r'Magic\s+(\+?-?\d+)',
                                    'luck': r'Luck\s+(\+?-?\d+)',
                                    'fullness': r'Fullness\s+(\+?-?\d+)'
                                }, {
                                    'natural_healing_buff': r'Natural Healing\s+(\+?-?\d+)',
                                    'overstuffed_buff': r'Overstuffed\s+(\+?-?\d+)',
                                    'retribution_buff': r'Retribution\s+(\+?-?\d+)',
                                    'herbalist_buff': r'Herbalist\s+(\+?-?\d+)',
                                    'rain_goddess_buff': r'Rain Goddess\s+(\+?-?\d+)',
                                    'swift_recovery_buff': r'Swift Recovery\s+(\+?-?\d+)',
                                    'posion_resistance_buff': r'Posion Resistance\s+(\+?-?\d+)',
                                    'water_resistance_buff': r'Water Resistance\s+(\+?-?\d+)',
                                    'fire_resistance_buff': r'Fire Resistance\s+(\+?-?\d+)',
                                    'luck_boost_buff': r'Luck Boost\s+(\+?-?\d+)',
                                    'night_owl_buff': r'Night Owl\s+(\+?-?\d+)',
                                    'sommer_magic_buff': r'Sommer Magic\s+(\+?-?\d+)',
                                    'spectral_scourge_buff': r'Spectral Scourge\s+(\+?-?\d+)',
                                })
                                food_bonuses.update(item_cell[1].split('\n'))
                                item['food_bonus'] = food_bonus
                            elif item_cell[0].startswith('Used in recipes'):
                                if isinstance(item_cell[1], dict) and item_cell[1]['link'] and item_cell[1]['value']:
                                    item['used_in_recipes'] = item_cell[1]['value']
                                else:
                                    item['used_in_recipes'] = item_cell[1]
                    print('add item {}'.format(name))
                    items.append(item)
    
    with open('items.json', 'w') as file:
        file.write(json.dumps(items, indent=4))

    pprint(fertilizer_bonuses)
    pprint(food_bonuses)


if __name__ == "__main__":
    main()