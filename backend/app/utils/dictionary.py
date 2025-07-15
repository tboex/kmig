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
                krWord: 가게
                Pronunciation: 가ː게
                Hanja: ''
                Part of Speech: 명사
                Definition: 작은 규모로 물건을 펼쳐 놓고 파는 집.
                English Meaning: shop; store
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
