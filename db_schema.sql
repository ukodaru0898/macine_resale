-- Machines table
CREATE TABLE machines (
    id SERIAL PRIMARY KEY,
    serial_number VARCHAR(100),
    model VARCHAR(100),
    status VARCHAR(50) -- e.g., 'refurbished', 'harvested', 'scrapped'
);

-- Modules table
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    machine_id INTEGER REFERENCES machines(id),
    name VARCHAR(100),
    sales_price NUMERIC,
    repair_cost NUMERIC,
    profit NUMERIC
);

-- Parts table
CREATE TABLE parts (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES modules(id),
    name VARCHAR(100),
    sales_price NUMERIC,
    repair_cost NUMERIC,
    profit NUMERIC,
    is_eol BOOLEAN DEFAULT FALSE,
    scrapped BOOLEAN DEFAULT FALSE,
    demand INTEGER -- 0 if no demand
);

-- EOL Price/Cost table
CREATE TABLE eol_part_prices (
    part_id INTEGER REFERENCES parts(id),
    eol_price NUMERIC,
    eol_cost NUMERIC,
    PRIMARY KEY (part_id)
);