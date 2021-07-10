#!/usr/bin/env python3

from sys import argv,exit
from ips import Patch


def main():
    if len(argv) < 2:
        print(f"Usage: {argv[0]} <ips file>")
        exit(1)
    with open(argv[1], 'rb') as ips:
        p = Patch(ips.read())

    for r in p.records:
        print(f"    this.set(0x{r.address - 0x10:05x}, [", end="")
        for b in r.content[:-1]:
            print(f"0x{b:02x}, ", end=" ")
        print(f"0x{r.content[-1]:02x}]);")


if __name__ == "__main__":
    main()
        



