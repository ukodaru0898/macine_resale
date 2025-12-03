import pandas as pd
from sqlalchemy import create_engine

PG_USER = 'machinedb_25'
PG_PASSWORD = 'AP5B1Qls6b8EuoixpWLOkObK0DuLg71y'
PG_HOST = 'dpg-d4hugrili9vc73eeml6g-a.oregon-postgres.render.com'
PG_DB = 'machineresaledb'
PG_PORT = '5432'

engine = create_engine(f'postgresql://{PG_USER}:{PG_PASSWORD}@{PG_HOST}:{PG_PORT}/{PG_DB}')

# Example: Query first 5 rows from the 'systems' table
try:
    df = pd.read_sql('SELECT * FROM user_input1 LIMIT 5', engine)
    print(df)
except Exception as e:
    print('Error querying database:', e)
