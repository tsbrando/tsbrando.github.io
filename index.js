VERSION = "2024.09.26";

$ = document.querySelector.bind(document);
$$ = document.querySelectorAll.bind(document);
ls = localStorage;

// separate player names
// /([a-z. ]*)([A-Z ]*)/.exec(name)

String.prototype.basename = function() {
    let index = this.lastIndexOf('/');
    if (index < 0)
        index = this.lastIndexOf('\\');
    return this.substring(index + 1);
}

class Rom extends Uint8Array {
    header() {
        return this.slice(0, 16);
    }

    set(addr, data) {
        for (let i = 0; i < data.length; i++) {
            // add 16 to skip the header
            this[addr + 16 + i] = data[i];
        }
    }

    addVersionString() {
        this.set(0xc4f3, Array.from(" TSB RANDO ", c => c.charCodeAt(0)));
        let version = "VERSION " + VERSION;
        version = version.padStart(
            Math.floor((24 - version.length) / 2) + version.length);
        version = version.padEnd(24);
        this.set(0xc4d9, Array.from(version, c => c.charCodeAt(0)));
    }

    noStarterReset() { // starting rosters do not reset when a player returns
        console.log("Disabling starter reset");
        this.set(0x22475, [0xea, 0xea, 0xea]);
    }

    fixReturnerSpeed() {
        console.log("Fixing returner speed");
        this.set(0x080f3, [0xf3,  0x03,  0xef,  0xe4,  0xdf,  0xfe,  0xff]);
        this.set(0x0aacd, [0xb1,  0x00,  0x00,  0xef,  0xe4,  0xdf,  0xfe,  0xff]);
    }

    randomStats() {
        console.log("Randomizing Stats");
        let stats = Array.from({length: 0xccc}, () => randint(0, 255));
        this.set(0x2ff0, stats)
        let runPassRatio = Array.from({length: 28}, () => randint(0, 3)); 
        this.set(0x27516, runPassRatio)
    }

    randomPlaybooks(allowBroken) {
        console.log("Randomizing playbooks");
        let playbooks;
        if (allowBroken) {
            playbooks = Array.from({length: 28 * 4}, () => randint(0, 255));
            for (let i=1; i < 28 * 4; i+=2) {
                playbooks[i] &= 0xf7; // no softlock plays
            }
        } else {
            playbooks = Array.from({length: 28 * 4}, () => randint(0, 255) & 0x77);
        }
        this.set(0x1d300, playbooks);
    }

    disablePlaybookEdit() {
        console.log("Disabling playbook editing");
        rom.set(0x2107d, [0x60]);
    }

    randomMusicLoop() {
        this.set(0x255dc, [0xea,  0xa5,  0x3c,  0x29,  0x07,  0xea]);
    }

    singleTeam() {
        console.log("Setting a single team to control");
        let team = 0x9b + randint(0, 27)
        this.set(0x32581, [0x49]); // change ADC to EOR so only one team can be MAN/COA
        this.set(0x3c080, [0xdf,  0xff]); // overwrite jump address
        this.set(0x3ffdf, [
            0x48,               // PHA
            0xad,  team,  0x66, // LDA <team_control>
            0xc9,  0x03,        // CMP #$02
            0x90,  0x05,        // BCC $FFED
            0xa9,  0x00,        // LDA #$00
            0x8d,  team,  0x66, // STA <team_control>
            0x68,               // PLA
            0x4c,  0x0e,  0xd6  // JMP $D60E
        ]);
    }
    setQuarterLength(length) {
        this.set(0x2223b, [length]);
    }

    splitQbCtrlAcc() {
        console.log("Splitting QB control/accuracy")
        this.set(0x29e44, [0x20,  0xf7,  0x9f]);
        this.set(0x29ff7, [0xa0,  0x88,  0x4c,  0xdd,  0x9f]);
    }

    improvePassingAI() {
        console.log("Improving passing AI");
        this.set(0x08509, [0x93,  0x54,  0x22]);
        this.set(0x085f1, [0x93,  0x84]);
        this.set(0x086a8, [0x93,  0x94,  0x55,  0x31]);
        this.set(0x08827, [0x94,  0x63,  0x45,  0x31]);
        this.set(0x08a45, [0x94,  0x51]);
        this.set(0x08b90, [0x93,  0x74,  0x45,  0x22]);
        this.set(0x08dc2, [0x63]);
        this.set(0x08dc4, [0x21]);
        this.set(0x08ff9, [0x93,  0x51,  0x54,  0x42]);
        this.set(0x090dd, [0x93,  0x54,  0x42]);
        this.set(0x0929c, [0x94,  0x83,  0x75,  0x52,  0x21]);
        this.set(0x092e0, [0x94,  0x73,  0x42,  0x21]);
        this.set(0x09304, [0x93,  0x54,  0x45,  0x21]);
        this.set(0x09341, [0x63,  0x64,  0x45,  0x42,  0x21]);
        this.set(0x09378, [0x94,  0x92,  0x53,  0x55]);
        this.set(0x093b1, [0x94,  0x73,  0x45,  0x22,  0x21]);
        this.set(0x093d6, [0x94,  0x63,  0x41,  0x32]);
        this.set(0x0940a, [0x93,  0x92,  0x44,  0x31]);
        this.set(0x0944b, [0x94,  0x53,  0x42]);
        this.set(0x0948a, [0x93,  0x54,  0x22]);
        this.set(0x094c1, [0x93,  0x54]);
        this.set(0x094cd, [0x93,  0x95,  0x54,  0x61,  0x22]);
        this.set(0x0950a, [0x93,  0x94,  0x72,  0x55]);
        this.set(0x09560, [0x94]);
        this.set(0x09562, [0x32]);
        this.set(0x0959e, [0x93,  0x75,  0x64,  0x42]);
        this.set(0x095cf, [0x93,  0x74,  0x52,  0x45,  0x31]);
        this.set(0x09601, [0x93,  0x94,  0x81,  0x75,  0x62]);
        this.set(0x0963e, [0x93,  0x95,  0x84,  0x42,  0x21]);
        this.set(0x0967b, [0x94,  0x83,  0x55,  0x32,  0x31]);
        this.set(0x096b3, [0x83,  0x54]);
        this.set(0x096bf, [0x83,  0x71,  0x54,  0x45,  0x22]);
        this.set(0x096f4, [0x94,  0x72,  0x53,  0x21]);
        this.set(0x09727, [0x73,  0x44]);
        this.set(0x09733, [0x95,  0x73,  0x62,  0x44,  0x21]);
        this.set(0x09755, [0x94,  0x95,  0x52,  0x43,  0x31]);
        this.set(0x09818, [0x94]);
        this.set(0x0981a, [0x31]);
        this.set(0x1da10, [0xa0,  0x00,  0x98,  0x48,  0x68,  0xa8,  0xc4,  0xdc,  0x90,  0x08,  0xf0,  0x06,  0xa5,  0x3b,  0x25,  0xdc,  0xa8,  0x60,  0xc8,  0xb1,  0x3e,  0x29,  0xf0,  0x4a,  0x85,  0xdd,  0xd0,  0x03,  0x4c,  0xe9,  0x9a,  0xb1,  0x3e,  0x29,  0xf0,  0x4a,  0x4a,  0x4a,  0x4a,  0x85,  0xde,  0x0a,  0x0a,  0x18,  0x65,  0xde,  0x85,  0xde,  0xb1,  0x3e,  0x29,  0x0f,  0x0a,  0xaa,  0x98,  0x48,  0xa0,  0x08,  0xb1,  0xae,  0x30,  0x0d,  0xbd,  0xeb,  0xde,  0x85,  0x40,  0xbd,  0xec,  0xde,  0x85,  0x41,  0x4c,  0x65,  0x9a,  0xbd,  0x01,  0xdf,  0x85,  0x40,  0xbd,  0x02,  0xdf,  0x85,  0x41,  0xa2,  0x14,  0xa0,  0x08,  0xb1,  0xae,  0x30,  0x0d,  0xbd,  0x01,  0xdf,  0x85,  0x42,  0xbd,  0x02,  0xdf,  0x85,  0x43,  0x4c,  0x84,  0x9a,  0xbd,  0xeb,  0xde,  0x85,  0x42,  0xbd,  0xec,  0xde,  0x85,  0x43,  0xa0,  0x15,  0xb1,  0x40,  0xd1,  0x42,  0x90,  0x1c,  0xd0,  0x07,  0x88,  0xb1,  0x40,  0xd1,  0x42,  0x90,  0x13,  0xa0,  0x14,  0xb1,  0x40,  0x38,  0xf1,  0x42,  0x85,  0x44,  0xc8,  0xb1,  0x40,  0xf1,  0x42,  0x85,  0x45,  0x4c,  0xb8,  0x9a,  0xa0,  0x14,  0xb1,  0x42,  0x38,  0xf1,  0x40,  0x85,  0x44,  0xc8,  0xb1,  0x42,  0xf1,  0x40,  0x85,  0x45,  0xa5,  0x45,  0xd0,  0x21,  0xa5,  0x44,  0xc5,  0xdd,  0xb0,  0x1b,  0xa0,  0x17,  0xb1,  0x40,  0xd1,  0x42,  0x90,  0x0a,  0xb1,  0x40,  0x38,  0xf1,  0x42,  0xc5,  0xde,  0x4c,  0xdb,  0x9a,  0xb1,  0x42,  0x38,  0xf1,  0x40,  0xc5,  0xde,  0x90,  0x07,  0xca,  0xca,  0x30,  0x06,  0x4c,  0x67,  0x9a,  0x4c,  0x14,  0x9a,  0x68,  0xa8,  0x60]);
        this.set(0x288ae, [0xa0,  0x10,  0xa2,  0x9a,  0xa9,  0x0e,  0x20,  0x54,  0xc4,  0xea,  0xea,  0xea,  0xea,  0xea,  0xea,  0xea,  0xea,  0xea,  0xea,  0xea,  0xea,  0xea,  0xea,  0xea,  0xea]);
        this.set(0x1da1c, [0xa0,  0x80,  0x60,  0xea,  0xea,  0xea]);
        this.set(0x288b7, [0xc0,  0x80,  0xd0,  0x05,  0xa9,  0x03,  0x4c,  0xcb,  0x88,  0x4c,  0xc7,  0x88]);
    }

    touchbackOnKickoff() {
        console.log("Enabling touchback on kickoffs");
        this.set(0x2410c, [0x20,  0x57,  0x90]);
        this.set(0x24894, [0x20,  0x70,  0x90]);
    }

    noClockOnKickoff() {
        console.log("No clock on kickoffs")
        this.set(0x240a8, [0x00]);
        this.set(0x24830, [0x00]);
    }

    noClockOnPunt() {
        console.log("No clock on punts")
        this.set(0x243a6, [0x00]);
        this.set(0x446ae, [0x00]);
    }

    save() {
        let url = URL.createObjectURL(new Blob([this]), {
            type: 'application/octet-stream'
        });
        let downloader = document.createElement('a');
        downloader.href = url;
        downloader.download = 'TSBRando.' + String(Date.now()) + '.nes';
        downloader.dispatchEvent(new MouseEvent('click'));
    }

    randomize() {
        if (!this.length) {
            alert("Please choose a ROM file!");
            return
        }

        this.addVersionString();
        if (ls.returnerSpeed) this.fixReturnerSpeed();
        if (ls.tbKickoff) this.touchbackOnKickoff();
        if (ls.randomStats) this.randomStats();
        if (ls.randomPlaybook) this.randomPlaybooks(ls.brokenPlays);
        if (ls.disablePbEdit) this.disablePlaybookEdit();
        if (ls.noStarterReset) this.noStarterReset();
        if (ls.randomMusic) this.randomMusicLoop();
        if (ls.singleTeam) this.singleTeam();
        if (ls.splitQbCtrl) this.splitQbCtrlAcc();
        if (ls.passingAI) this.improvePassingAI();
        if (ls.noClockOnKickoff) this.noClockOnKickoff();
        if (ls.noClockOnPunt) this.noClockOnPunt();
        this.setQuarterLength(Number(ls.quarterLength))
        this.save();
    }

}

function randint(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function restoreSettings() {
    // Restore settings from last time
    if (!ls.quarterLength)
        ls.quarterLength = 3;
    $('#quarter-length').selectedOptions = Number(ls.quarterLength) - 1;
    $('#quarter-length-display').innerText = ls.quarterLength;

    if (ls.randomStats === undefined) 
        ls.randomStats = true;
    $('#random-stats').checked = ls.randomStats;

    if (ls.randomPlaybook === undefined) 
        ls.randomPlaybook = true;
    $('#random-playbook').checked = ls.randomPlaybook;

    if (ls.brokenPlays === undefined) 
        ls.brokenPlays = "";
    $('#broken-plays').checked = ls.brokenPlays;

    if (ls.disablePbEdit === undefined)
        ls.disablePbEdit = true;
    $('#disable-pb-edit').checked = ls.disablePbEdit;

    if (ls.noStarterReset === undefined)
        ls.noStarterReset = "";
    $('#no-starter-reset').checked = ls.noStarterReset;

    if (ls.randomMusic === undefined)
        ls.randomMusic = true;
    $('#random-music').checked = ls.randomMusic;

    if (ls.singleTeam === undefined)
        ls.singleTeam = true;
    $('#single-team').checked = ls.singleTeam;

    if (ls.splitQbCtrl === undefined)
        ls.splitQbCtrl = true;
    $('#split-qb-ctrl').checked = ls.splitQbCtrl;

    if (ls.passingAI === undefined)
        ls.passingAI = true;
    $('#passing-ai').checked = ls.passingAI;

    if (ls.returnerSpeed === undefined)
        ls.returnerSpeed = true;
    $('#returner-speed').checked = ls.returnerSpeed;

    if (ls.tbKickoff === undefined)
        ls.tbKickoff = true;
    $('#tb-kickoff').checked = ls.tbKickoff;


    if (ls.noClockOnKickoff === undefined)
        ls.noClockOnKickoff = true;
    $('#no-clock-on-kickoff').checked = ls.noClockOnKickoff;

    if (ls.noClockOnPunt === undefined)
        ls.noClockOnPunt = "";
    $('#no-clock-on-punt').checked = ls.noClockOnPunt;
}

function updateInputFile(input) {
    filename = input.value.basename()
    display = $('#input-file-display')
    if (filename) {
        display.innerText = input.value.basename();
        display.style.color = 'white';
        input.files[0].arrayBuffer().then(buffer => {
            rom = new Rom(buffer);
            rom.name = ls.romName = filename;
            ls.romData = rom;
            init_teams();
        });
    } else {
        display.innerText = 'No file selected';
        display.style.color = '#aaa';
    }

}

window.addEventListener('load', event => {
    restoreSettings();
    $('#version').innerText = VERSION;
    $('#randomize').addEventListener('click', event => {
        rom.randomize($('#inputfile').files[0]);
    });

    $('#random-stats').addEventListener('change', function(event) {
        ls.randomStats = this.checked || '';
    });

    $('#random-playbook').addEventListener('change', function(event) {
        ls.randomPlaybook = this.checked || '';
    });

    $('#broken-plays').addEventListener('change', function(event) {
        ls.brokenPlays = this.checked || '';
    });

    $('#disable-pb-edit').addEventListener('change', function(event) {
        ls.disablePbEdit = this.checked || '';
    });

    $('#no-starter-reset').addEventListener('change', function(event) {
        ls.noStarterReset = this.checked || '';
    });

    $('#random-music').addEventListener('change', function(event) {
        ls.randomMusic = this.checked || '';
    });

    $('#single-team').addEventListener('change', function(event) {
        ls.singleTeam = this.checked || '';
    });

    $('#split-qb-ctrl').addEventListener('change', function(event) {
        ls.splitQbCtrl = this.checked || '';
    });

    $('#passing-ai').addEventListener('change', function(event) {
        ls.passingAI = this.checked || '';
    });

    $('#tb-kickoff').addEventListener('change', function(event) {
        ls.tbKickoff = this.checked || '';
    });

    $('#returner-speed').addEventListener('change', function(event) {
        ls.returnerSpeed = this.checked || '';
    });

    $('#no-clock-on-kickoff').addEventListener('change', function(event) {
        ls.noClockOnKickoff = this.checked || '';
    });

    $('#no-clock-on-punt').addEventListener('change', function(event) {
        ls.passingAI = this.checked || '';
    });

    $('#quarter-length').addEventListener('change', function(event) {
        let value = this.selectedOptions[0].value;
        $('#quarter-length-display').innerText = value;
        ls.quarterLength = value;
    })

    updateInputFile($('#inputfile'));
    $('#inputfile').addEventListener('change', function(event) {
        updateInputFile(this);
    });

    if (ls.romData) {
        rom = new Rom(ls.romData.split(','));
        if (ls.romName) {
            rom.name = ls.romName
            let display = $('#input-file-display');
            display.innerText = ls.romName;
            display.style.color = 'white';
        }
    } else {
        rom = new Rom();
    }
});
