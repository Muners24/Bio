import * as Tone from 'tone';

/* Mapeo de notas musicales */
export const noteMap = {
    "a/0": "A0", "b/0": "B0",
    "c/1": "C1", "d/1": "D1", "e/1": "E1", "f/1": "F1", "g/1": "G1", "a/1": "A1", "b/1": "B1",
    "c/2": "C2", "d/2": "D2", "e/2": "E2", "f/2": "F2", "g/2": "G2", "a/2": "A2", "b/2": "B2",
    "c/3": "C3", "d/3": "D3", "e/3": "E3", "f/3": "F3", "g/3": "G3", "a/3": "A3", "b/3": "B3",
    "c/4": "C4", "d/4": "D4", "e/4": "E4", "f/4": "F4", "g/4": "G4", "a/4": "A4", "b/4": "B4",
    "c/5": "C5", "d/5": "D5", "e/5": "E5", "f/5": "F5", "g/5": "G5", "a/5": "A5", "b/5": "B5",
    "c/6": "C6", "d/6": "D6", "e/6": "E6", "f/6": "F6", "g/6": "G6", "a/6": "A6", "b/6": "B6",
    "c/7": "C7", "d/7": "D7", "e/7": "E7", "f/7": "F7", "g/7": "G7", "a/7": "A7", "b/7": "B7"
};

export const durationMap = {
    "1": "1n",   // redonda
    "2": "2n",   // blanca
    "4": "4n",   // negra
    "8": "8n",   // corchea
    "16": "16n", // semicorchea
    "32": "32n", // fusa
    "64": "64n", // semifusa
};

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function noteToMidi(note) {
    const regex = /^([A-G]#?)(\d)$/;
    const match = note.match(regex);
    if (!match) return null;
    const [_, pitchClass, octaveStr] = match;
    const octave = parseInt(octaveStr, 10);
    const noteIndex = NOTES.indexOf(pitchClass);
    if (noteIndex === -1) return null;
    return noteIndex + (octave + 1) * 12;
}

export function midiToNoteName(midi) {
    if (midi < 0 || midi > 127) return null;
    const noteIndex = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    return NOTES[noteIndex] + octave;
}

export function midiNameToVexNote(midiName){
    const noteMapInverse = Object.fromEntries(
        Object.entries(noteMap).map(([k, v]) => [v, k])
    );
   
    return noteMapInverse[midiName.replace(/[#b]/g, '')];
}

function transposeNoteForClef(noteStr, clef = "treble") {
    try {
        const offsetByClef = {
            treble: 0,
            bass: -12,
            alto: -6,
            tenor: -8,
        };

        const baseNote = noteMap[noteStr];
        if (!baseNote) return undefined;

        const midi = noteToMidi(baseNote);
        const transpose = offsetByClef[clef] || 0;
        return midiToNoteName(midi + transpose);
    } catch (e) {
        console.warn(`No se pudo transponer la nota ${noteStr}:`, e);
        return noteMap[noteStr];
    }
}

export default class VexPlayer {
    static count = 0;
    constructor() {
        this.isPlaying = false;
        this.samplerCache = new Map();
        this.currentlyPlayingNotes = new Set();
        this.currentTransport = null;
        this.scheduledEvents = [];
        this.notacionActual = null;
    }

    async getSampler(instrument) {
        const key = instrument.urlName;
        if (this.samplerCache.has(key)) return this.samplerCache.get(key);

        const sampler = await new Promise((resolve) => {
            const s = new Tone.Sampler({
                urls: {
                    A0: "A0.mp3", B0: "B0.mp3",
                    C1: "C1.mp3", D1: "D1.mp3", E1: "E1.mp3", F1: "F1.mp3", G1: "G1.mp3", A1: "A1.mp3", B1: "B1.mp3",
                    C2: "C2.mp3", D2: "D2.mp3", E2: "E2.mp3", F2: "F2.mp3", G2: "G2.mp3", A2: "A2.mp3", B2: "B2.mp3",
                    C3: "C3.mp3", D3: "D3.mp3", E3: "E3.mp3", F3: "F3.mp3", G3: "G3.mp3", A3: "A3.mp3", B3: "B3.mp3",
                    C4: "C4.mp3", D4: "D4.mp3", E4: "E4.mp3", F4: "F4.mp3", G4: "G4.mp3", A4: "A4.mp3", B4: "B4.mp3",
                    C5: "C5.mp3", D5: "D5.mp3", E5: "E5.mp3", F5: "F5.mp3", G5: "G5.mp3", A5: "A5.mp3", B5: "B5.mp3",
                    C6: "C6.mp3", D6: "D6.mp3", E6: "E6.mp3", F6: "F6.mp3", G6: "G6.mp3", A6: "A6.mp3", B6: "B6.mp3",
                    C7: "C7.mp3", D7: "D7.mp3", E7: "E7.mp3", F7: "F7.mp3", G7: "G7.mp3", A7: "A7.mp3", B7: "B7.mp3",
                },
                release: 0.5,
                baseUrl: `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/${key}/`,
                onload: () => resolve(s)
            }).toDestination();
        });

        this.samplerCache.set(key, sampler);
        return sampler;
    }

    _getKeyForNote(note, instrument) {
        return JSON.stringify({
            instrument: instrument.urlName,
            keys: [...note.keys].sort(),
            dur: note.dur || "4n"
        });
    }

    async play(notacion) {
        if (this.isPlaying) {
            console.log("Ya hay una reproducción en curso");
            return;
        }

        this.stop();
        this.isPlaying = true;

        this.notacionActual = notacion;
        this.currentTransport = Tone.getTransport();

        this.currentTransport.bpm.value = notacion[0].tempo;

        this.scheduledEvents = [];

        for (const part of notacion) {
            const sampler = await this.getSampler(part.instrument);

            let time = 0;

            for (const nota of part.notas) {
                if (nota.dur.includes('r')) {
                    time += Tone.Time(durationMap[nota.dur.replace('r', '')]).toSeconds();
                    continue;
                }

                const dur = durationMap[nota.dur];
                // Aplicar transposición según la clave del part
                const toneKeys = nota.keys
                    .map(k => transposeNoteForClef(k, part.clef))
                    .filter(k => k !== undefined);

                if (toneKeys.length > 0) {
                    const id = this.currentTransport.schedule((t) => {
                        sampler.triggerAttackRelease(toneKeys, dur, t);
                    }, `+${time}`);

                    this.scheduledEvents.push(id);
                }

                time += Tone.Time(dur).toSeconds();
            }
        }

        this.currentTransport.start();
    }

    stop() {
        if (this.currentTransport) {
            this.scheduledEvents.forEach(id => this.currentTransport.clear(id));
            this.scheduledEvents = [];
            this.currentTransport.stop();
            this.currentTransport.cancel();
        }

        this.isPlaying = false;
        this.notacionActual = null;
    }

    pause() {
        if (!this.isPlaying || !this.currentTransport) return;
        this.currentTransport.pause();
        this.isPlaying = false;
    }

    resume() {
        if (this.isPlaying || !this.currentTransport) return;
        this.isPlaying = true;
        this.currentTransport.start();
    }

    reset() {
        if (!this.notacionActual) return;
        if (this.currentTransport) {
            this.scheduledEvents.forEach(id => this.currentTransport.clear(id));
            this.scheduledEvents = [];
            this.currentTransport.stop();
            this.currentTransport.cancel();
        }

        this.isPlaying = false;
        this.play(this.notacionActual);
    }

    async playNote(note) {
        const key = this._getKeyForNote(note, note.instrument);
        if (this.currentlyPlayingNotes.has(key)) {
            return;
        }
        this.currentlyPlayingNotes.add(key);

        // Asegúrate que AudioContext está iniciado
        await Tone.start();

        const sampler = await this.getSampler(note.instrument);
        // Obtener duración en segundos para evitar confusiones
        const durStr = note.dur ? durationMap[note.dur] || "4n" : "4n";
        const durSec = Tone.Time(durStr).toSeconds();

        const now = Tone.now();

        const clef = note.clef || "treble";

        const toneKeys = note.keys
            .map(k => transposeNoteForClef(k, clef))
            .filter(k => k !== undefined);

        if (toneKeys.length === 0) {
            console.error("No se pudieron mapear las teclas a notas válidas");
            this.currentlyPlayingNotes.delete(key);
            return;
        }

        // Disparar nota
        sampler.triggerAttackRelease(toneKeys, durSec, now);

        setTimeout(() => this.currentlyPlayingNotes.delete(key), durSec * 1000);
    }

    clearCache() {
        for (const sampler of this.samplerCache.values()) {
            sampler.dispose();
        }
        this.samplerCache.clear();
    }

    setIsPlaying(value) {
        this.isPlaying = value;
        return this;
    }

    getIsPlaying() {
        return this.isPlaying;
    }
}
