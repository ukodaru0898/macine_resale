import numpy as np
import pandas as pd

from toolBox import tools

class optimizer:

    def version1(self):

        tool = tools()

        df_systems, df_modules, df_parts, df_qtc, df_qtc_modules, df_qtc_parts, df_core_inv, df_model_table = tool.read_data()

        df_input1, df_input2 = tool.user_input()

        df_req_demand = tool.req_demand(df_systems,'12', 'A')

        df_input1['Machine type'] = df_input1['Machine type'].str.lstrip('/')
        df_input1['Machine type'] = df_input1['Machine type'].str.strip()
        
        # Convert Deal outcome probability from string percentage to decimal
        df_input1['Deal outcome probability'] = df_input1['Deal outcome probability'].apply(lambda x: 
            float(str(x).replace('%', '')) / 100 if isinstance(x, str) and '%' in str(x) 
            else (float(x) / 100 if isinstance(x, (int, float)) and float(x) > 1 else float(x))
        )

        df_bundle = df_input1[['Machine type', 'Offered Bundle','Units in sales pipeline','Deal outcome probability']].rename(columns={
            'Machine type': 'Machine',
            'Offered Bundle': 'Bundle',
            'Units in sales pipeline': 'Pipe_units',
            'Deal outcome probability': 'Pipe_prob'
        }).copy()

        #df_bundle['Pipeline'] = (df_bundle['Pipe_units'] * df_bundle['Pipe_prob']).apply(lambda x: np.floor(x + 0.5))
        df_bundle['Pipeline'] = df_bundle['Pipe_units']

        df_deltas_inventory = tool.deltas_refurbish(df_qtc, 'Inventory')
        df_deltas_bundle = tool.deltas_refurbish(df_qtc, 'Bundle')

        df_result = tool.optimize_buy(df_req_demand, df_bundle, df_deltas_bundle, df_deltas_inventory, df_core_inv)

        base_harvest = 'PAS5500/22/60/80'

        if df_result.loc[df_result['Machine'] == base_harvest, 'Bundle'].iloc[0] > 0 :

            module_req_demand = tool.req_demand(df_modules,'12', 'B')
            part_req_demand = tool.req_demand(df_parts,'12', 'C')

            df_result = tool.optimize_harvest(module_req_demand, part_req_demand, df_result, df_qtc_modules, df_qtc_parts, base_harvest)

        # pd.set_option('display.max_columns', None)
        # print(df_result)

        df_bb = df_result.merge(
            df_input1[['Machine type','Required margin (%)']],  
            left_on='Machine',     
            right_on='Machine type',    
            how='left'               
        )

        output1, output2 = tool.bb_recom(df_bb, df_input2)

        with pd.ExcelWriter('MasterDB.xlsx', engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
            output1.to_excel(writer, sheet_name='out_bb', index=False)

        with pd.ExcelWriter('MasterDB.xlsx', engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
            output2.to_excel(writer, sheet_name='out_tot', index=False)

        return 1
