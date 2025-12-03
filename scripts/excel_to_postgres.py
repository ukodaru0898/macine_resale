import pandas as pd
from sqlalchemy import create_engine

# Update these with your actual PostgreSQL credentials
PG_USER = 'machinedb_25'
PG_PASSWORD = 'AP5B1Qls6b8EuoixpWLOkObK0DuLg71y'
PG_HOST = 'dpg-d4hugrili9vc73eeml6g-a.oregon-postgres.render.com'
PG_DB = 'machineresaledb'
PG_PORT = '5432'

# Path to your Excel file
EXCEL_PATH = 'Base.xlsx'  # Update path if needed

# Create SQLAlchemy engine for PostgreSQL
engine = create_engine(f'postgresql://{PG_USER}:{PG_PASSWORD}@{PG_HOST}:{PG_PORT}/{PG_DB}')

# List of sheet names to migrate (update as needed)
sheets = [
    'Systems',
    'Modules',
    'Parts',
    'QTC',
    'QTC Modules',
    'QTC Parts',
    'CoreQInventory',
    'ModelTable',
    'User Input1',
    'User Input2'
]


for sheet in sheets:
    print(f'Processing sheet: {sheet}')
    try:
        df = pd.read_excel(EXCEL_PATH, sheet_name=sheet)
    except ValueError:
        print(f"  -> Sheet '{sheet}' not found in {EXCEL_PATH}, skipping.")
        continue
    # Clean column names
    df.columns = df.columns.str.strip()
    # Write to PostgreSQL (replace table if exists)
    df.to_sql(sheet.lower().replace(' ', '_'), engine, if_exists='replace', index=False)
    print(f'  -> Written to table: {sheet.lower().replace(' ', '_')}')

print('All sheets migrated to PostgreSQL!')
