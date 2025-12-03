from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Machine(Base):
    __tablename__ = 'machines'
    id = Column(Integer, primary_key=True)
    serial_number = Column(String(100))
    model = Column(String(100))
    status = Column(String(50))  # e.g., 'refurbished', 'harvested', 'scrapped'

class Module(Base):
    __tablename__ = 'modules'
    id = Column(Integer, primary_key=True)
    machine_id = Column(Integer, ForeignKey('machines.id'))
    name = Column(String(100))
    sales_price = Column(Float)
    repair_cost = Column(Float)
    profit = Column(Float)

class Part(Base):
    __tablename__ = 'parts'
    id = Column(Integer, primary_key=True)
    module_id = Column(Integer, ForeignKey('modules.id'))
    name = Column(String(100))
    sales_price = Column(Float)
    repair_cost = Column(Float)
    profit = Column(Float)
    is_eol = Column(Boolean, default=False)
    scrapped = Column(Boolean, default=False)
    demand = Column(Integer)  # 0 if no demand

class EOLPartPrice(Base):
    __tablename__ = 'eol_part_prices'
    part_id = Column(Integer, ForeignKey('parts.id'), primary_key=True)
    eol_price = Column(Float)
    eol_cost = Column(Float)
