import pandas as pd

# Load the CSV file into a DataFrame
df = pd.read_csv('app/utils/dictionary.csv')


def remove_substring_from_column(df: pd.DataFrame, column_name: str, substring: str) -> pd.DataFrame:
    '''
    Remove rows from the DataFrame where the specified column contains the given substring.

    :param df: The DataFrame to clean.
    :param column_name: The name of the column to check for the substring.
    :param substring: The substring to remove from the column.
    :return: A new DataFrame with the rows containing the substring removed.
    '''
    return df[~df[column_name].astype(str).str.contains(substring, na=False)]


column_name = 'form'
substring_to_remove = '-'

df_cleaned = remove_substring_from_column(df, column_name, substring_to_remove)

# Save the cleaned DataFrame to a new CSV file
df_cleaned.to_csv('app/utils/dictionary_cleaned.csv', index=False)
