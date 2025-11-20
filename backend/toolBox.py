import pandas as pd
import numpy as np


class tools:
    def save_demands_to_base(self, df_systems, df_modules, df_parts, base_file="Base.xlsx"):
        """
        Save updated system, module, and part demand DataFrames back to Base.xlsx.
        """
        import openpyxl
        with pd.ExcelWriter(base_file, engine="openpyxl", mode="a", if_sheet_exists="replace") as writer:
            df_systems.to_excel(writer, sheet_name="Systems", index=False)
            df_modules.to_excel(writer, sheet_name="Modules", index=False)
            df_parts.to_excel(writer, sheet_name="Parts", index=False)
        print(f"Demands saved to {base_file} (Systems, Modules, Parts)")

    def read_data(self):

        df_systems = pd.read_excel("MasterDB.xlsx", sheet_name="Systems")
        df_systems.columns = df_systems.columns.str.strip()  # Remove leading/trailing spaces
        
        df_modules = pd.read_excel("MasterDB.xlsx", sheet_name="Modules")
        df_modules.columns = df_modules.columns.str.strip()
        
        df_parts = pd.read_excel("MasterDB.xlsx", sheet_name="Parts")
        df_parts.columns = df_parts.columns.str.strip()
        
        df_qtc = pd.read_excel("MasterDB.xlsx", sheet_name="QTC")
        df_qtc['Input type'] = df_qtc['Input type'].str.lstrip('/')
        df_qtc['Input type'] = df_qtc['Input type'].str.strip()

        df_qtc_modules = pd.read_excel("MasterDB.xlsx", sheet_name="QTC Modules")
        df_qtc_parts = pd.read_excel("MasterDB.xlsx", sheet_name="QTC Parts")
        df_core_inv = pd.read_excel("MasterDB.xlsx", sheet_name="CoreQInventory")
        df_core_inv['System'] = df_core_inv['System'].str.lstrip('/')
        df_core_inv['System'] = df_core_inv['System'].str.strip()

        df_model_table = pd.read_excel("MasterDB.xlsx", sheet_name="ModelTable")

        return df_systems, df_modules, df_parts, df_qtc, df_qtc_modules, df_qtc_parts, df_core_inv, df_model_table

    def user_input(self):

        df_input1 = pd.read_excel("MasterDB.xlsx", sheet_name="User Input1")
        df_input2 = pd.read_excel("MasterDB.xlsx", sheet_name="User Input2")

        return df_input1, df_input2

    def req_demand(self, df, month_dem, type):

        col_demand = "Demand_" + month_dem + "M"
        col_invent = "Qinventory_" + month_dem + "M"

        df['req_demand'] = df[col_demand] - df[col_invent]

        if type == 'A' :

            df_demand = df[['System', 'req_demand']].copy()

        elif type == 'B' :

            df_demand = df[['Module', 'req_demand']].copy()

        else :

            # For Parts, the first column 'Module' contains the part numbers
            df_demand = df[['Module', 'req_demand']].copy()
            df_demand.rename(columns={'Module': 'Part'}, inplace=True)

        return df_demand

    def deltas_refurbish(self, df, type):

        df_deltas = df[['Output type','Input type','Buy source system','Audit / De-install','Freight (inbound)',
                        'Total refurbishment cost','Total cost','Sales price (ASP)','Net Sales']].rename(columns={
            'Output type': 'output',
            'Input type': 'base',
            'Buy source system': 'Buy',
            'Audit / De-install': 'Desinstall_cost',
            'Freight (inbound)': 'Freight_cost',
            'Total refurbishment cost': 'Refurb_cost',
            'Total cost': 'Tot_cost',
            'Sales price (ASP)': 'Price',
            'Net Sales': 'Net_price'
        }).copy()

        if type == 'Inventory':

            df_deltas['Cost'] = df_deltas['Tot_cost'] - df_deltas['Buy'] - df_deltas['Desinstall_cost'] - df_deltas['Freight_cost']

        else :

            df_deltas['Cost'] = df_deltas['Tot_cost'] - df_deltas['Buy']
         
            
        df_deltas['Delta'] = df_deltas['Net_price'] - df_deltas['Cost']

        return df_deltas

    def optimize_buy(self, demanda, bundle, bundle_delta, inv_delta, inventario):

        recommend = bundle.copy()

        recommend['bb'] = 0
        recommend['inv_use'] = 0 
        recommend['to_ref'] = 0 
        recommend['to_harv'] = 0
        recommend['delta'] = 0.0
        recommend['price'] = 0.0
        recommend['cost'] = 0.0
        recommend['price_mod'] = 0.0
        recommend['cost_mod'] = 0.0
        recommend['price_part'] = 0.0
        recommend['cost_part'] = 0.0

        counter = 0

        bundle_delta_sorted = bundle_delta.sort_values(by='Delta', ascending=False)

        while demanda['req_demand'].sum() > 0 and recommend['Bundle'].sum() > 0 and counter < len(bundle_delta_sorted):
           
            base = bundle_delta_sorted['base'].iloc[counter]
            output = bundle_delta_sorted['output'].iloc[counter]
           
            # Check if base exists in recommend DataFrame
            base_mask = recommend['Machine'] == base
            if not base_mask.any() or recommend.loc[base_mask, 'Bundle'].iloc[0] <= 0:
                counter += 1
                continue
            
            # Check if output exists in demanda DataFrame
            output_mask = demanda['System'] == output
            if not output_mask.any() or demanda.loc[output_mask, 'req_demand'].iloc[0] <= 0:
                counter += 1
                continue

            #print(bundle_delta)
            delta_bundle = bundle_delta.loc[(bundle_delta['base'] == base) & (bundle_delta['output'] == output), 'Delta'].iloc[0]
            price = bundle_delta.loc[(bundle_delta['base'] == base) & (bundle_delta['output'] == output), 'Net_price'].iloc[0]
            cost = bundle_delta.loc[(bundle_delta['base'] == base) & (bundle_delta['output'] == output), 'Tot_cost'].iloc[0]
            bb_price = bundle_delta.loc[(bundle_delta['base'] == base) & (bundle_delta['output'] == output), 'Buy'].iloc[0]

            # Check if base exists in inventario DataFrame
            inv_base_mask = inventario['System'] == base
            if inv_base_mask.any() and inventario.loc[inv_base_mask, 'CoreInventory'].iloc[0] > 0:

                delta_inv = inv_delta.loc[(inv_delta['base'] == base) & (inv_delta['output'] == output), 'Delta'].iloc[0]
              
                if  delta_bundle > delta_inv :

                    recommend.loc[recommend['Machine'] == base, 'bb'] += 1
                    recommend.loc[recommend['Machine'] == base, 'Bundle'] -= 1
                    demanda.loc[demanda['System'] == output, 'req_demand'] -= 1
                    recommend.loc[recommend['Machine'] == base, 'to_ref'] += 1
                    recommend.loc[recommend['Machine'] == base, 'delta'] += delta_bundle
                    recommend.loc[recommend['Machine'] == base, 'price'] += price
                    recommend.loc[recommend['Machine'] == base, 'cost'] += cost - bb_price

                else :

                    inventario.loc[inventario['System'] == base, 'CoreInventory'] -= 1
                    demanda.loc[demanda['System'] == output, 'req_demand'] -= 1
                    recommend.loc[recommend['Machine'] == base, 'inv_use'] += 1

            elif recommend.loc[recommend['Machine'] == base, 'Pipeline'].iloc[0] > 0:

                recommend.loc[recommend['Machine'] == base, 'Pipeline'] -= 1
                demanda.loc[demanda['System'] == output, 'req_demand'] -= 1
                recommend.loc[recommend['Machine'] == base, 'inv_use'] += 1

            else :
               
                recommend.loc[recommend['Machine'] == base, 'bb'] += 1
                recommend.loc[recommend['Machine'] == base, 'Bundle'] -= 1
                demanda.loc[demanda['System'] == output, 'req_demand'] -= 1
                recommend.loc[recommend['Machine'] == base, 'to_ref'] += 1
                recommend.loc[recommend['Machine'] == base, 'delta'] += delta_bundle
                recommend.loc[recommend['Machine'] == base, 'price'] += price
                recommend.loc[recommend['Machine'] == base, 'cost'] += cost - bb_price

            #print(demanda)
            #print(recommend)

        return recommend


    def optimize_harvest(self, demanda_mod, demanda_parts, bundle, delta_mod, delta_parts, harv_system):

        quant_harvest = bundle.loc[bundle['Machine'] == harv_system, 'Bundle'].iloc[0]

        demanda_mod['Delta'] = 0.0
        demanda_parts['Delta'] = 0.0
        demanda_mod['price'] = 0.0
        demanda_parts['price'] = 0.0
        demanda_mod['cost'] = 0.0
        demanda_parts['cost'] = 0.0

        while quant_harvest > 0:

            flag_buy = 0

            if demanda_mod['req_demand'].sum() > 0 :

                int_count = 0
            
                while int_count < len(demanda_mod):
                
                    if demanda_mod.loc[int_count, 'req_demand'] > 0 :

                        module = demanda_mod.loc[int_count, 'Module']
                        # # Check if module exists in delta_mod
                        # module_match = delta_mod[delta_mod['Module'] == module]
                        # if len(module_match) == 0:
                            # print(f"Warning: Module '{module}' not found in QTC Modules sheet, skipping")
                            # int_count += 1
                            # continue
                            
                        # delta = module_match['Delta Cost'].iloc[0]
                        delta = delta_mod.loc[delta_mod['Module'] == module, 'Delta Cost'].iloc[0]
                        price = delta_mod.loc[delta_mod['Module'] == module, '275 SCP'].iloc[0]
                        cost = delta_mod.loc[delta_mod['Module'] == module, 'Total Cost'].iloc[0]

                        # price = module_match['275 SCP'].iloc[0]
                        # cost = module_match['Total Cost'].iloc[0]

                        demanda_mod.loc[int_count, 'Delta'] += delta
                        demanda_mod.loc[int_count, 'price'] += price
                        demanda_mod.loc[int_count, 'cost'] += cost
                        demanda_mod.loc[demanda_mod['Module'] == module, 'req_demand'] -= 1
               
                    int_count += 1     

                flag_buy = 1

            if demanda_parts['req_demand'].sum() > 0 :

                int_count = 0
            
                while int_count < len(demanda_parts):
                
                    if demanda_parts.loc[int_count, 'req_demand'] > 0 :

                        module = demanda_parts.loc[int_count, 'Part']
                        # Check if part exists in delta_parts
                        # part_match = delta_parts[delta_parts['Part'] == module]
                        # if len(part_match) == 0:
                            # print(f"Warning: Part '{module}' not found in QTC Parts sheet, skipping")
                            # int_count += 1
                            # continue
                            
                        # delta = part_match['Delta Cost'].iloc[0]
                        # price = part_match['275 SCP'].iloc[0]
                        # cost = part_match['Total Cost'].iloc[0]
                        delta = delta_parts.loc[delta_parts['Part'] == module, 'Delta Cost'].iloc[0]
                        price = delta_parts.loc[delta_parts['Part'] == module, '275 SCP'].iloc[0]
                        cost = delta_parts.loc[delta_parts['Part'] == module, 'Total Cost'].iloc[0]
                        
                        demanda_parts.loc[int_count, 'Delta'] += delta
                        demanda_parts.loc[int_count, 'price'] += price
                        demanda_parts.loc[int_count, 'cost'] += cost
                        demanda_parts.loc[demanda_parts['Part'] == module, 'req_demand'] -= 1
               
                    int_count += 1     

                flag_buy = 1
            
            if flag_buy == 1 :

                bundle.loc[bundle['Machine'] == harv_system, 'bb'] += 1
                bundle.loc[bundle['Machine'] == harv_system, 'Bundle'] -= 1
                bundle.loc[bundle['Machine'] == harv_system, 'to_harv'] += 1
                bundle.loc[bundle['Machine'] == harv_system, 'delta'] += demanda_mod['Delta'].sum() / 1000.0
                bundle.loc[bundle['Machine'] == harv_system, 'delta'] += demanda_parts['Delta'].sum() / 1000.0
                bundle.loc[bundle['Machine'] == harv_system, 'price_mod'] += demanda_mod['price'].sum() / 1000.0
                bundle.loc[bundle['Machine'] == harv_system, 'price_part'] += demanda_parts['price'].sum() / 1000.0
                bundle.loc[bundle['Machine'] == harv_system, 'cost_mod'] += demanda_mod['cost'].sum() / 1000.0
                bundle.loc[bundle['Machine'] == harv_system, 'cost_part'] += demanda_parts['cost'].sum() / 1000.0
                bundle.loc[bundle['Machine'] == harv_system, 'price'] += demanda_mod['price'].sum() / 1000.0 + demanda_parts['price'].sum() / 1000.0
                bundle.loc[bundle['Machine'] == harv_system, 'cost'] += demanda_mod['cost'].sum() / 1000.0 + demanda_parts['cost'].sum() / 1000.0

            quant_harvest -= 1

        return bundle
    
    def bb_recom(self, df_bb, df_input2) :

        df_input2['Profit'] = 0.0
        df_input2['Margin_toGet'] = 0.0

        # Debug: Print df_bb to see what data we have
        print("\n=== DEBUG: df_bb data ===")
        print(df_bb[['Machine', 'bb', 'to_ref', 'to_harv', 'price', 'cost', 'price_mod', 'cost_mod', 'price_part', 'cost_part']])
        print("\n=== DEBUG: df_input2 before calculations ===")
        print(df_input2)

        #df_bb['Recommended_BB_Price'] = df_bb['price'] * (1 - df_bb['Required margin (%)'] / 100.0) - df_bb['cost']
        df_bb['Recommended_BB_Price'] = (df_bb['price'] + df_bb['price_mod'] + df_bb['price_part']) * (1 - df_bb['Required margin (%)'] / 100.0) - (df_bb['cost'] + df_bb['cost_mod'] + df_bb['cost_part'])

        price_ref = df_bb[df_bb['to_ref'] > 0]['price'].sum()
        cost_ref = df_bb[df_bb['to_ref'] > 0]['cost'].sum()
        margin_ref = df_input2.loc[df_input2['Metric'] == 'Refurbishment', 'Required Margin'].iloc[0] / 100.0

        print(f"\n=== Refurbishment Calculations ===")
        print(f"price_ref: {price_ref}")
        print(f"cost_ref: {cost_ref}")
        print(f"margin_ref: {margin_ref}")
        print(f"Max_BBB_Valuation = {price_ref} * (1 - {margin_ref}) - {cost_ref} = {price_ref * (1 - margin_ref) - cost_ref}")
        print(f"Profit = {price_ref} - {cost_ref} = {price_ref - cost_ref}")
        if price_ref > 0:
            print(f"Margin_toGet = ({price_ref} - {cost_ref}) / {price_ref} * 100 = {(price_ref - cost_ref) / price_ref * 100.0}")

        df_input2.loc[df_input2['Metric'] == 'Refurbishment', 'Max_BBB_Valuation'] = price_ref * (1 - margin_ref) - cost_ref
        df_input2.loc[df_input2['Metric'] == 'Refurbishment', 'Profit'] = price_ref - cost_ref
        if price_ref > 0:
            df_input2.loc[df_input2['Metric'] == 'Refurbishment', 'Margin_toGet'] = round((price_ref - cost_ref) / price_ref * 100.0, 2)

        price_mod = df_bb[df_bb['to_harv'] > 0]['price_mod'].sum()
        cost_mod = df_bb[df_bb['to_harv'] > 0]['cost_mod'].sum()
        margin_mod = df_input2.loc[df_input2['Metric'] == 'Harvesting - Module', 'Required Margin'].iloc[0] / 100.0

        df_input2.loc[df_input2['Metric'] == 'Harvesting - Module', 'Max_BBB_Valuation'] = price_mod * (1 - margin_mod) - cost_mod
        df_input2.loc[df_input2['Metric'] == 'Harvesting - Module', 'Profit'] = price_mod - cost_mod
        df_input2.loc[df_input2['Metric'] == 'Harvesting - Module', 'Margin_toGet'] = round((price_mod - cost_mod) / price_mod * 100.0, 2)

        price_parts = df_bb[df_bb['to_harv'] > 0]['price_part'].sum()
        cost_parts = df_bb[df_bb['to_harv'] > 0]['cost_part'].sum()
        margin_part = df_input2.loc[df_input2['Metric'] == 'Harvesting - Parts', 'Required Margin'].iloc[0] / 100.0

        df_input2.loc[df_input2['Metric'] == 'Harvesting - Parts', 'Max_BBB_Valuation'] = price_parts * (1 - margin_part) - cost_parts
        df_input2.loc[df_input2['Metric'] == 'Harvesting - Parts', 'Profit'] = price_parts - cost_parts
        df_input2.loc[df_input2['Metric'] == 'Harvesting - Parts', 'Margin_toGet'] = round((price_parts - cost_parts) / price_parts * 100.0, 2)

        price_tot = df_bb[df_bb['bb'] > 0]['price'].sum() + df_bb[df_bb['bb'] > 0]['price_mod'].sum() + df_bb[df_bb['bb'] > 0]['price_part'].sum()
        cost_tot = df_bb[df_bb['bb'] > 0]['cost'].sum() + df_bb[df_bb['bb'] > 0]['cost_mod'].sum() + df_bb[df_bb['bb'] > 0]['cost_part'].sum()
        margin_tot = df_input2.loc[df_input2['Metric'] == 'Total', 'Required Margin'].iloc[0] / 100.0

        df_input2.loc[df_input2['Metric'] == 'Total', 'Max_BBB_Valuation'] = price_tot * (1 - margin_tot) - cost_tot
        df_input2.loc[df_input2['Metric'] == 'Total', 'Profit'] = price_tot - cost_tot
        df_input2.loc[df_input2['Metric'] == 'Total', 'Margin_toGet'] = round((price_tot - cost_tot) / price_tot * 100.0, 2)

        output1 = df_bb[['Machine', 'bb','inv_use','Required margin (%)','Recommended_BB_Price']].rename(columns={
            'bb': 'Recommended Buy',
            'inv_use': 'recommended from inventory',
            'Recommended_BB_Price': 'Recommended BB Price',
        }).copy()

        output1['Machine'] = '/' + output1['Machine']

        return output1, df_input2
