import pandas as pd
import openpyxl

# Read the Excel file
excel_file = '/Users/vennimalaimohans/Downloads/excel.xlsx'
xls = pd.ExcelFile(excel_file, engine='openpyxl')

# Display all sheet names
print('Available sheets:')
for sheet in xls.sheet_names:
    print(f'  - {sheet}')
