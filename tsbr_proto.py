#!/usr/bin/env python3

import sys
from random import randint
import ips
from time import time

def apply_patch(rom, filename):
    with open(filename, 'rb') as p:
        patch = p.read()
    ips.apply_ips(rom, patch)

with open(sys.argv[1], 'rb') as r:
    rom_data = bytearray(r.read())

apply_patch(rom_data, 'patches/KR_speed_fix.ips')
apply_patch(rom_data, 'patches/PR_speed_fix.ips')
#  apply_patch(rom_data, 'patches/In game playbook changing.ips')
#  apply_patch(rom_data, 'patches/huddle-break.ips')
apply_patch(rom_data, 'patches/cpu_passing_ai_hack.ips')
apply_patch(rom_data, 'patches/3minquarter.ips')
apply_patch(rom_data, 'patches/touchback_on_kickoffs.ips')
apply_patch(rom_data, 'patches/no_clock_on_kickoffs.ips')

stats = [randint(0,255) for _ in range(0xccc)]

rom_data[0x3000:0x3ccc] = stats

playbooks = [randint(0,255) & 0x77 for _ in range(0x70)]
rom_data[0x1d310:0x1d380] = playbooks


team = 0x9b + randint(0, 27)
rom_data[0x32591] = 0x49 # change ADC to EOR so only one team can be MAN/COA
rom_data[0x3c090:0x3c092] = (0xdf,  0xff) # overwrite jump address
# sets a predetermined team to MAN if it's SKP/COM on reset.
rom_data[0x3ffef:0x40000] = (
    0x48,               # PHA
    0xad,  team,  0x66, # LDA <team_control>
    0xc9,  0x03,        # CMP #$02
    0x90,  0x05,        # BCC $FFED
    0xa9,  0x00,        # LDA #$00
    0x8d,  team,  0x66, # STA <team_control>
    0x68,               # PLA
    0x4c,  0x0e,  0xd6  # JMP $D60E
)

# disable playbook editing
rom_data[0x2108d] = 0x60

with open(f'TSBRando.{int(time())}.nes', 'wb') as r:
    r.write(rom_data)

