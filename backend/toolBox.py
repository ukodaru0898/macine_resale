
import pandas as pd


class tools:

    def __init__(self):
        # Collect warnings about missing sheets/columns so optimizer can surface them
        self.warnings = {
            'missing_sheets': [],
            'missing_columns': {}
        }

    def _safe_read(self, sheet_name, required_cols=None):
        """Read a sheet; if missing create empty with required columns and record warning.

        - If the sheet is missing, return an empty DataFrame with required columns and warn.
        - If required columns are missing, add them (filled with 0/empty) and warn.
        """
        try:
            df = pd.read_excel("MasterDB.xlsx", sheet_name=sheet_name)
        except Exception:
            # Missing sheet: create empty with required columns and warn
            self.warnings.setdefault('missing_sheets', []).append(sheet_name)
            cols = required_cols or []
            df = pd.DataFrame(columns=cols)
        # Normalize header whitespace
        df.columns = df.columns.astype(str).str.strip()
        # Known header alias fixes per sheet
        alias_maps = {
            'Parts': {
                'Module': 'Part'
            },
            'QTC': {
                'Output type': 'Output_type',
                'Input type': 'Input_type',
                'Buy source system': 'Buy_source_system',
                'Audit / De-install': 'Audit_De_install',
                'Freight (inbound)': 'Freight_inbound',
                'Total refurbishment cost': 'Total_refurbishment_cost',
                'Total cost': 'Total_cost',
                'Sales price (ASP)': 'Sales_price_ASP',
                'Sales_price': 'Sales_price_ASP',
                'Sales Price': 'Sales_price_ASP',
                'Net Sales': 'Net_Sales'
            },
            'QTC Modules': {
                'Delta Cost': 'Delta_Cost',
                '275 SCP': '275_SCP',
                'Total Cost': 'Total_Cost'
            },
            'QTC Parts': {
                'Delta Cost': 'Delta_Cost',
                '275 SCP': '275_SCP',
                'Total Cost': 'Total_Cost'
            }
        }
        if sheet_name in alias_maps:
            for old, new in alias_maps[sheet_name].items():
                if old in df.columns and new not in df.columns:
                    df.rename(columns={old: new}, inplace=True)
        # Ensure required columns exist
        if required_cols:
            missing = [c for c in required_cols if c not in df.columns]
            if missing:
                # Warn and add missing columns with default values
                self.warnings.setdefault('missing_columns', {})[sheet_name] = missing
                for c in missing:
                    df[c] = 0
        # Coerce numeric-looking columns (exclude obvious id columns)
        for col in df.columns:
            if col.lower() not in {"output_type","input_type","system","module","part","type","id_component","machine type","metric"}:
                df[col] = pd.to_numeric(df[col], errors='coerce')
                df[col] = df[col].fillna(0)
        return df

    def read_data(self):

        df_systems = self._safe_read("Systems", ["System","Demand_12M","Qinventory_12M"])        
        df_modules = self._safe_read("Modules", ["Module","Demand_12M","Qinventory_12M"])        
        df_parts = self._safe_read("Parts", ["Part","Demand_12M","Qinventory_12M"])        
        df_qtc = self._safe_read("QTC", ["Output_type","Input_type","Buy_source_system","Audit_De_install","Freight_inbound","Total_refurbishment_cost","Total_cost","Sales_price_ASP","Net_Sales"])        
        if 'Input_type' in df_qtc.columns:
            df_qtc['Input_type'] = df_qtc['Input_type'].astype(str).str.lstrip('/').str.strip()

        df_qtc_modules = self._safe_read("QTC Modules", ["Module","Delta_Cost","275_SCP","Total_Cost"])        
        df_qtc_parts = self._safe_read("QTC Parts", ["Part","Delta_Cost","275_SCP","Total_Cost"])        
        df_core_inv = self._safe_read("CoreQInventory", ["System","CoreInventory"])        
        if 'System' in df_core_inv.columns:
            df_core_inv['System'] = df_core_inv['System'].astype(str).str.lstrip('/').str.strip()

        # Matrix Model is optional in current logic; if missing, continue with empty
        try:
            df_model_table = self._safe_read("Matrix Model", [])
        except RuntimeError:
            self.warnings.setdefault('optional_missing', []).append('Matrix Model')
            df_model_table = pd.DataFrame()
        df_scrap = self._safe_read("Scrap", ["Type","id_component","scrap_value","residual_value"])        

        return df_systems, df_modules, df_parts, df_qtc, df_qtc_modules, df_qtc_parts, df_core_inv, df_model_table, df_scrap

    def user_input(self):

        df_input1 = self._safe_read("User Input1", ["Machine type","Offered Bundle","Units in sales pipeline","Deal outcome probability","Required margin (%)"])        
        df_input2 = self._safe_read("User Input2", ["Metric","Required Margin","Max_BBB_Valuation"])        

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

            df_demand = df[['Part', 'req_demand']].copy()

        return df_demand

    def deltas_refurbish(self, df, type):

        df_deltas = df[['Output_type','Input_type','Buy_source_system','Audit_De_install','Freight_inbound',
                        'Total_refurbishment_cost','Total_cost','Sales_price_ASP','Net_Sales']].rename(columns={
            'Output_type': 'output',
            'Input_type': 'base',
            'Buy_source_system': 'Buy',
            'Audit_De_install': 'Desinstall_cost',
            'Freight_inbound': 'Freight_cost',
            'Total_refurbishment_cost': 'Refurb_cost',
            'Total_cost': 'Tot_cost',
            'Sales_price_ASP': 'Sales_price',
            'Net_Sales': 'Net_price'
        }).copy()

        # Ensure numeric columns are numeric; fill non-numeric with 0
        num_cols = ['Buy','Desinstall_cost','Freight_cost','Refurb_cost','Tot_cost','Sales_price','Net_price']
        for c in num_cols:
            if c not in df_deltas.columns:
                df_deltas[c] = 0
            df_deltas[c] = pd.to_numeric(df_deltas[c], errors='coerce').fillna(0)

        if type == 'Inventory':

            df_deltas['Cost'] = df_deltas['Tot_cost'] - df_deltas['Buy'] - df_deltas['Desinstall_cost'] - df_deltas['Freight_cost']

        else :

            df_deltas['Cost'] = df_deltas['Tot_cost'] - df_deltas['Buy']
         
            
        df_deltas['Delta'] = df_deltas['Sales_price'] - df_deltas['Cost']

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
        recommend['cost_scrap'] = 0.0
        recommend['price_scrap'] = 0.0

        counter = 0

        bundle_delta_sorted = bundle_delta.sort_values(by='Delta', ascending=False)

        #print(demanda)

        while demanda['req_demand'].sum() > 0 and recommend['Bundle'].sum() > 0 and counter < len(bundle_delta_sorted):

            base = bundle_delta_sorted['base'].iloc[counter]
            output = bundle_delta_sorted['output'].iloc[counter]

            sel_bundle = recommend.loc[recommend['Machine'] == base, 'Bundle']
            if sel_bundle.empty or sel_bundle.iloc[0] <= 0:
                counter += 1
                continue

            if not demanda.loc[demanda['System'] == output].empty and demanda.loc[demanda['System'] == output, 'req_demand'].iloc[0] > 0:

                    #print(bundle_delta)
                    delta_bundle = bundle_delta.loc[(bundle_delta['base'] == base) & (bundle_delta['output'] == output), 'Delta'].iloc[0]
                    price = bundle_delta.loc[(bundle_delta['base'] == base) & (bundle_delta['output'] == output), 'Sales_price'].iloc[0]
                    cost = bundle_delta.loc[(bundle_delta['base'] == base) & (bundle_delta['output'] == output), 'Tot_cost'].iloc[0]
                    bb_price = bundle_delta.loc[(bundle_delta['base'] == base) & (bundle_delta['output'] == output), 'Buy'].iloc[0]

                    if inventario.loc[inventario['System'] == base, 'CoreInventory'].iloc[0] > 0 :

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

            else:
                counter += 1

            #print(demanda)
            #print(recommend)

        return recommend


    def optimize_harvest(self, demanda_mod, demanda_parts, bundle, delta_mod, delta_parts, harv_system, scrap):

        quant_harvest = bundle.loc[bundle['Machine'] == harv_system, 'Bundle'].iloc[0]

        demanda_mod['Delta'] = 0.0
        demanda_parts['Delta'] = 0.0
        demanda_mod['price'] = 0.0
        demanda_parts['price'] = 0.0
        demanda_mod['cost'] = 0.0
        demanda_parts['cost'] = 0.0
        demanda_mod['cost_scrap'] = 0.0
        demanda_parts['cost_scrap'] = 0.0
        demanda_mod['price_scrap'] = 0.0
        demanda_parts['price_scrap'] = 0.0

        pd.set_option('display.max_columns', None)
        print(bundle)

        while quant_harvest > 0:

            flag_buy = 0

            if demanda_mod['req_demand'].sum() > 0 :

                int_count = 0
            
                while int_count < len(demanda_mod):
                
                    if demanda_mod.loc[int_count, 'req_demand'] > 0 :

                        module = demanda_mod.loc[int_count, 'Module']
                        delta = delta_mod.loc[delta_mod['Module'] == module, 'Delta_Cost'].iloc[0]
                        price = delta_mod.loc[delta_mod['Module'] == module, '275_SCP'].iloc[0]
                        cost = delta_mod.loc[delta_mod['Module'] == module, 'Total_Cost'].iloc[0]

                        demanda_mod.loc[int_count, 'Delta'] += delta
                        demanda_mod.loc[int_count, 'price'] += price
                        demanda_mod.loc[int_count, 'cost'] += cost
                        demanda_mod.loc[demanda_mod['Module'] == module, 'req_demand'] -= 1

                    else :

                        module = demanda_mod.loc[int_count, 'Module']
                        # Scrap handling for modules: separate price_scrap (residual_value) and cost_scrap (scrap_value)
                        sel = scrap.loc[(scrap['Type'] == 'Module') & (scrap['id_component'] == module)]
                        if not sel.empty:
                            demanda_mod.loc[int_count, 'price_scrap'] += sel['residual_value'].iloc[0]
                            demanda_mod.loc[int_count, 'cost_scrap'] += sel['scrap_value'].iloc[0]


                    int_count += 1     

                flag_buy = 1

            else:

                int_count = 0
            
                while int_count < len(demanda_mod):
                
                    module = demanda_mod.loc[int_count, 'Module']
                    sel = scrap.loc[(scrap['Type'] == 'Module') & (scrap['id_component'] == module)]
                    if not sel.empty:
                        demanda_mod.loc[int_count, 'price_scrap'] += sel['residual_value'].iloc[0]
                        demanda_mod.loc[int_count, 'cost_scrap'] += sel['scrap_value'].iloc[0]

                    int_count += 1 

            if demanda_parts['req_demand'].sum() > 0 :

                int_count = 0
            
                while int_count < len(demanda_parts):
                
                    if demanda_parts.loc[int_count, 'req_demand'] > 0 :

                        module = demanda_parts.loc[int_count, 'Part']
                        delta = delta_parts.loc[delta_parts['Part'] == module, 'Delta_Cost'].iloc[0]
                        price = delta_parts.loc[delta_parts['Part'] == module, '275_SCP'].iloc[0]
                        cost = delta_parts.loc[delta_parts['Part'] == module, 'Total_Cost'].iloc[0]

                        demanda_parts.loc[int_count, 'Delta'] += delta
                        demanda_parts.loc[int_count, 'price'] += price
                        demanda_parts.loc[int_count, 'cost'] += cost
                        demanda_parts.loc[demanda_parts['Part'] == module, 'req_demand'] -= 1
                    
                    else :

                        module = demanda_parts.loc[int_count, 'Part']
                        sel = scrap.loc[(scrap['Type'] == 'Part') & (scrap['id_component'] == module)]
                        if not sel.empty:
                            demanda_parts.loc[int_count, 'price_scrap'] += sel['residual_value'].iloc[0]
                            demanda_parts.loc[int_count, 'cost_scrap'] += sel['scrap_value'].iloc[0]

                    int_count += 1     

                flag_buy = 1
            
            else:

                int_count = 0
            
                while int_count < len(demanda_parts):
                
                    module = demanda_parts.loc[int_count, 'Part']
                    sel = scrap.loc[(scrap['Type'] == 'Part') & (scrap['id_component'] == module)]
                    if not sel.empty:
                        demanda_parts.loc[int_count, 'price_scrap'] += sel['residual_value'].iloc[0]
                        demanda_parts.loc[int_count, 'cost_scrap'] += sel['scrap_value'].iloc[0]

                    int_count += 1 

            if flag_buy == 1:
                
                bundle.loc[bundle['Machine'] == harv_system, 'bb'] += 1
                bundle.loc[bundle['Machine'] == harv_system, 'Bundle'] -= 1
                bundle.loc[bundle['Machine'] == harv_system, 'to_harv'] += 1
            
            quant_harvest -= 1

           
        bundle.loc[bundle['Machine'] == harv_system, 'delta'] += demanda_mod['Delta'].sum() / 1000.0
        bundle.loc[bundle['Machine'] == harv_system, 'delta'] += demanda_parts['Delta'].sum() / 1000.0
        bundle.loc[bundle['Machine'] == harv_system, 'price_mod'] += demanda_mod['price'].sum() / 1000.0
        bundle.loc[bundle['Machine'] == harv_system, 'price_part'] += demanda_parts['price'].sum() / 1000.0
        bundle.loc[bundle['Machine'] == harv_system, 'cost_mod'] += demanda_mod['cost'].sum() / 1000.0
        bundle.loc[bundle['Machine'] == harv_system, 'cost_part'] += demanda_parts['cost'].sum() / 1000.0
        bundle.loc[bundle['Machine'] == harv_system, 'price'] += demanda_mod['price'].sum() / 1000.0 + demanda_parts['price'].sum() / 1000.0
        bundle.loc[bundle['Machine'] == harv_system, 'cost'] += demanda_mod['cost'].sum() / 1000.0 + demanda_parts['cost'].sum() / 1000.0
        bundle.loc[bundle['Machine'] == harv_system, 'cost_scrap'] += demanda_mod['cost_scrap'].sum() + demanda_parts['cost_scrap'].sum()
        bundle.loc[bundle['Machine'] == harv_system, 'price_scrap'] += demanda_mod['price_scrap'].sum() + demanda_parts['price_scrap'].sum()

        print(bundle)

        return bundle

    def bb_recom(self, df_bb, df_input2) :

        df_input2['Profit'] = 0.0
        df_input2['Margin_toGet'] = 0.0
        # Ensure valuation column can hold floats to avoid FutureWarning
        if 'Max_BBB_Valuation' in df_input2.columns:
            df_input2['Max_BBB_Valuation'] = df_input2['Max_BBB_Valuation'].astype(float)

        # pd.set_option('display.max_columns', None)
        print(df_bb)

        df_bb['Recommended_BB_Price'] = (df_bb['price'] + df_bb['price_scrap']) * (1 - df_bb['Required margin (%)'] / 100.0) - (df_bb['cost'] + df_bb['cost_scrap'])

        print(df_bb)

        # Helper for safe margin
        def safe_margin(price, cost):
            return (price - cost) / price if price and price != 0 else 0.0

        price_ref = df_bb['price'].sum() - df_bb[df_bb['to_harv'] > 0]['price_mod'].sum() - df_bb[df_bb['to_harv'] > 0]['price_part'].sum()
        cost_ref = df_bb['cost'].sum() - df_bb[df_bb['to_harv'] > 0]['cost_mod'].sum() - df_bb[df_bb['to_harv'] > 0]['cost_part'].sum()
        refurb_row = df_input2.loc[df_input2['Metric'] == 'Refurbishment', 'Required Margin']
        margin_ref = refurb_row.iloc[0] / 100.0 if not refurb_row.empty else 0.0

        df_input2.loc[df_input2['Metric'] == 'Refurbishment', 'Max_BBB_Valuation'] = price_ref * (1 - margin_ref) - cost_ref if price_ref else -cost_ref
        df_input2.loc[df_input2['Metric'] == 'Refurbishment', 'Profit'] = price_ref - cost_ref
        df_input2.loc[df_input2['Metric'] == 'Refurbishment', 'Margin_toGet'] = safe_margin(price_ref, cost_ref)

        price_mod = df_bb[df_bb['to_harv'] > 0]['price_mod'].sum()
        cost_mod = df_bb[df_bb['to_harv'] > 0]['cost_mod'].sum()
        module_row = df_input2.loc[df_input2['Metric'] == 'Harvesting - Module', 'Required Margin']
        margin_mod = module_row.iloc[0] / 100.0 if not module_row.empty else 0.0

        df_input2.loc[df_input2['Metric'] == 'Harvesting - Module', 'Max_BBB_Valuation'] = price_mod * (1 - margin_mod) - cost_mod if price_mod else -cost_mod
        df_input2.loc[df_input2['Metric'] == 'Harvesting - Module', 'Profit'] = price_mod - cost_mod
        df_input2.loc[df_input2['Metric'] == 'Harvesting - Module', 'Margin_toGet'] = safe_margin(price_mod, cost_mod)

        price_parts = df_bb[df_bb['to_harv'] > 0]['price_part'].sum()
        cost_parts = df_bb[df_bb['to_harv'] > 0]['cost_part'].sum()
        parts_row = df_input2.loc[df_input2['Metric'] == 'Harvesting - Parts', 'Required Margin']
        margin_part = parts_row.iloc[0] / 100.0 if not parts_row.empty else 0.0

        df_input2.loc[df_input2['Metric'] == 'Harvesting - Parts', 'Max_BBB_Valuation'] = price_parts * (1 - margin_part) - cost_parts if price_parts else -cost_parts
        df_input2.loc[df_input2['Metric'] == 'Harvesting - Parts', 'Profit'] = price_parts - cost_parts
        df_input2.loc[df_input2['Metric'] == 'Harvesting - Parts', 'Margin_toGet'] = safe_margin(price_parts, cost_parts)

        price_tot = df_bb[df_bb['bb'] > 0]['price'].sum()
        cost_wo_scrap = df_bb[df_bb['bb'] > 0]['cost'].sum()
        cost_scrap_tot = df_bb[df_bb['bb'] > 0]['cost_scrap'].sum()
        price_scrap_tot = df_bb[df_bb['bb'] > 0]['price_scrap'].sum()
 
        # Total Without Scrap
        tot_wo_row = df_input2.loc[df_input2['Metric'] == 'Total Without Scrap', 'Required Margin']
        margin_wo = tot_wo_row.iloc[0] / 100.0 if not tot_wo_row.empty else 0.0
        df_input2.loc[df_input2['Metric'] == 'Total Without Scrap', 'Max_BBB_Valuation'] = price_tot * (1 - margin_wo) - cost_wo_scrap
        df_input2.loc[df_input2['Metric'] == 'Total Without Scrap', 'Profit'] = price_tot - cost_wo_scrap
        df_input2.loc[df_input2['Metric'] == 'Total Without Scrap', 'Margin_toGet'] = safe_margin(price_tot, cost_wo_scrap)

        # Scrap only
        scrap_row = df_input2.loc[df_input2['Metric'] == 'Scrap', 'Required Margin']
        margin_scrap = scrap_row.iloc[0] / 100.0 if not scrap_row.empty else 0.0
        df_input2.loc[df_input2['Metric'] == 'Scrap', 'Max_BBB_Valuation'] = price_scrap_tot * (1 - margin_scrap) - cost_scrap_tot
        df_input2.loc[df_input2['Metric'] == 'Scrap', 'Profit'] = price_scrap_tot - cost_scrap_tot
        df_input2.loc[df_input2['Metric'] == 'Scrap', 'Margin_toGet'] = 0

        # Total With Scrap
        with_scrap_row = df_input2.loc[df_input2['Metric'] == 'Total With Scrap', 'Required Margin']
        margin_with = with_scrap_row.iloc[0] / 100.0 if not with_scrap_row.empty else 0.0
        price_with = price_tot + price_scrap_tot
        cost_with = cost_wo_scrap + cost_scrap_tot
        df_input2.loc[df_input2['Metric'] == 'Total With Scrap', 'Max_BBB_Valuation'] = price_with * (1 - margin_with) - cost_with
        df_input2.loc[df_input2['Metric'] == 'Total With Scrap', 'Profit'] = price_with - cost_with
        df_input2.loc[df_input2['Metric'] == 'Total With Scrap', 'Margin_toGet'] = safe_margin(price_with, cost_with)

        output1 = df_bb[['Machine', 'bb','inv_use','Required margin (%)','Recommended_BB_Price']].rename(columns={
            'bb': 'Recommended Buy',
            'inv_use': 'recommended from inventory',
            'Recommended_BB_Price': 'Recommended BB Price',
        }).copy()

        output1['Machine'] = '/' + output1['Machine']

        return output1, df_input2

    def scrap_pro(self, bundle, scrap, qtc):
        
        counter = 0

        while bundle['Bundle'].sum() > 0:
           
            if bundle['Bundle'].iloc[counter] > 0 :

                scrap_cost = 0
                scrap_price = 0

                base = bundle['Machine'].iloc[counter]
                bundle.loc[bundle['Machine'] == base, 'Bundle'] -= 1
                bundle.loc[bundle['Machine'] == base, 'bb'] += 1

                qtc_match = qtc.loc[qtc['Input_type'] == base]
                if not qtc_match.empty:
                    scrap_cost += qtc_match['Audit_De_install'].iloc[0] + qtc_match['Freight_inbound'].iloc[0]
                else:
                    self.warnings.setdefault('missing_qtc_rows', []).append(base)

                scrap_match = scrap.loc[(scrap['Type'] == 'System') & (scrap['id_component'] == base)]
                if not scrap_match.empty:
                    scrap_cost += scrap_match['scrap_value'].iloc[0]
                    scrap_price += scrap_match['residual_value'].iloc[0]
                else:
                    self.warnings.setdefault('missing_scrap_rows', []).append(base)

                bundle.loc[bundle['Machine'] == base, 'cost_scrap'] += scrap_cost
                bundle.loc[bundle['Machine'] == base, 'price_scrap'] += scrap_price

            elif counter < len(bundle) - 1:

                counter += 1

            else :

                counter = 0

        return bundle

