# Pseudocode for harvesting profit calculator

def harvesting_profit_calculator(machine):
    total_profit = 0
    for module in machine.modules:
        module_profit = module.sales_price - module.repair_cost
        for part in module.parts:
            if part.demand > 0:
                module_profit += part.sales_price - part.repair_cost
            else:
                module_profit -= part.scrap_cost  # Assume scrap_cost is available
        total_profit += module_profit
    return total_profit
