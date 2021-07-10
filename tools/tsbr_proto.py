#!/usr/bin/env python3

import sys
from random import randint
from time import time
import ips

class Rom:
    def __init__(self, filename):
        with open(filename, 'rb') as f:
            self.rom_data = bytearray(f.read())

    def header(self):
        return self.rom_data[:16];

    def set(self, addr, data):
        self.rom_data[addr+16:addr + len(data) + 16] = data

    def randomStats(self):
        stats = [randint(0,255) for _ in range(0xccc)]
        this.set(0x2ff0, stats)

    def randomPlaybooks(self):
        # disable playbook editing
        self.set(0x2107d, [0x60])
        playbooks = [randint(0,255) & 0x77 for _ in range(0x70)]
        self.set(0x1d300, playbooks)

    def singleTeam(self):
        team = 0x9b + randint(0, 27)
        self.set(0x32581, [0x49]) # change ADC to EOR so only one team can be MAN/COA
        self.set(0x3c080, [0xdf,  0xff]) # overwrite jump address
        self.set(0x3ffdf, [
            0x48,               # PHA
            0xad,  team,  0x66, # LDA <team_control>
            0xc9,  0x03,        # CMP #$02
            0x90,  0x05,        # BCC $FFED
            0xa9,  0x00,        # LDA #$00
            0x8d,  team,  0x66, # STA <team_control>
            0x68,               # PLA
            0x4c,  0x0e,  0xd6  # JMP $D60E
        ]);

    def save(self, filename=f'TSBRando.{int(time())}.nes'):
        with open(filename, 'wb') as r:
            r.write(rom_data)

    def apply_patch(filename):
        with open(filename, 'rb') as p:
            patch = p.read()
        ips.apply_ips(self.rom_data, patch)

rom = Rom(sys.argv[1])

rom.apply_patch('patches/KR_speed_fix.ips')
rom.apply_patch('patches/PR_speed_fix.ips')
#  rom.apply_patch('patches/In game playbook changing.ips')
rom.apply_patch('patches/cpu_passing_ai_hack.ips')
rom.apply_patch('patches/3minquarter.ips')
rom.apply_patch('patches/touchback_on_kickoffs.ips')
rom.apply_patch('patches/no_clock_on_kickoffs.ips')

rom.randomStats()
rom.randomStats()
rom.singleTeam()
rom.save()

