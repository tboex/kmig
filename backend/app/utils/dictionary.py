import csv
import logging

from settings import LOGGER_NAME


logger = logging.getLogger(LOGGER_NAME)


def load_dictionary(filepath) -> dict[str, dict]:
    '''
    Loads data from csv into a dictionary keyed by 'korean word'.
    Expected CSV format:
      krWord, Pronunciation, Hanja, Part of Speech, Definition, English Meaning

    Args:
        filepath (str): The path to the CSV file.

    Returns:
        dict: a dictionary where each key is the 'korean word'
        {
            '가게': {
                korean: 가게
                part_of_speech: 명사
                korea_definition: 작은 규모로 물건을 펼쳐 놓고 파는 집.
                english_definition: shop; store
                usages: []
                vocabulary_level: 초급
                semantic_category: 장소
            }
        }
    '''
    data = {}
    with open(filepath, 'r', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data[row.get('korean', '')] = row

    logging.info('Successfuly loaded dictionary')
    return data
