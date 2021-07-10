#!/usr/bin/env python3

import ips
from math import log, ceil

patch = ips.Patch()

def new():
    patch.clear()

def SET(addr:int, bytes_:int):
    patch.add_record(addr, bytes_.to_bytes(ceil(log(bytes_, 256)), 'big'))

def save(filename:str):
    with open(filename, 'wb') as p:
        p.write(patch.encode())

