
import numpy as np
import pandas as pd

from toolBox import tools

class optimizer:

    def version1(self):

        tool = tools()

        df_systems, df_modules, df_parts, df_qtc, df_qtc_modules, df_qtc_parts, df_core_inv, df_model_table, df_scrap = tool.read_data()

        # If essential sheets missing, early warning (still proceed with empty frames)
        critical = ["Systems","QTC","QTC Modules","QTC Parts","CoreQInventory","Scrap","User Input1","User Input2"]
        missing_critical = [s for s in critical if s in tool.warnings.get('missing_sheets', [])]

        df_input1, df_input2 = tool.user_input()

        df_req_demand = tool.req_demand(df_systems,'12', 'A')

        df_input1['Machine type'] = df_input1['Machine type'].str.lstrip('/')
        df_input1['Machine type'] = df_input1['Machine type'].str.strip()

        df_bundle = df_input1[['Machine type', 'Offered Bundle','Units in sales pipeline','Deal outcome probability']].rename(columns={
            'Machine type': 'Machine',
            'Offered Bundle': 'Bundle',
            'Units in sales pipeline': 'Pipe_units',
            'Deal outcome probability': 'Pipe_prob'
        }).copy()

        df_bundle['Pipeline'] = df_bundle['Pipe_units']

        df_deltas_inventory = tool.deltas_refurbish(df_qtc, 'Inventory')
        df_deltas_bundle = tool.deltas_refurbish(df_qtc, 'Bundle')

        df_result = tool.optimize_buy(df_req_demand, df_bundle, df_deltas_bundle, df_deltas_inventory, df_core_inv)

        base_harvest = 'PAS5500/22/60/80'
        #print(df_result)

        sel_harvest = df_result.loc[df_result['Machine'] == base_harvest, 'Bundle']
        if not sel_harvest.empty and sel_harvest.iloc[0] > 0:

            module_req_demand = tool.req_demand(df_modules,'12', 'B')
            part_req_demand = tool.req_demand(df_parts,'12', 'C')

            df_result = tool.optimize_harvest(module_req_demand, part_req_demand, df_result, df_qtc_modules, df_qtc_parts, base_harvest, df_scrap)

        # pd.set_option('display.max_columns', None)
        # print(df_result)

        if df_result['Bundle'].sum() > 0:
            df_result_scrap = tool.scrap_pro(df_result, df_scrap, df_qtc)
        else:
            df_result_scrap = df_result

        df_bb = df_result_scrap.merge(
            df_input1[['Machine type','Required margin (%)']],  
            left_on='Machine',     
            right_on='Machine type',    
            how='left'               
        )

        output1, output2 = tool.bb_recom(df_bb, df_input2)

        with pd.ExcelWriter('MasterDB.xlsx', engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
            output1.to_excel(writer, sheet_name='out_bb', index=False)
            output2.to_excel(writer, sheet_name='out_tot', index=False)
            # Persist warnings if any
            warn_rows = []
            for ms in tool.warnings.get('missing_sheets', []):
                warn_rows.append({'category': 'missing_sheet', 'detail': ms})
            for sheet, cols in tool.warnings.get('missing_columns', {}).items():
                warn_rows.append({'category': 'missing_columns', 'detail': f"{sheet}: {', '.join(cols)}"})
            if missing_critical:
                warn_rows.append({'category': 'critical_missing', 'detail': ', '.join(missing_critical)})
            if warn_rows:
                pd.DataFrame(warn_rows).to_excel(writer, sheet_name='warnings', index=False)

        return 1
