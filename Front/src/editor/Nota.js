//StaveNote
import { StaveNote, Modifier, Annotation, Accidental, Articulation } from "vexflow";
import VexRec from "./VexRec";
import Notacion from './Notacion';
import VexPlayer from "./VexPlayer";
import instruments from "./Instruments";
export default class Nota extends VexRec {

    constructor(keys = [], duracion = "4", instrument = {...instruments[19]}, clef = 'treble') {
        super(0, 0, 0, 10);
        this.player = new VexPlayer();
        this.isPlaying = false;

        this.clef = clef;
        this.instrument = instrument;

        this.keys = keys;
        this.duracion = duracion;
        this.accidentals = new Map();
        this.articulations = [];
        this.dotted = false;
        this.dynamic = ''
        this.text = '';

        this.playing = false;
        this.selected = false;
        this.key_selected = '';

        this.stem_dir = 1;

        this.nota;
        this.rec;

        this.inTuplet = false;

        this.notas_order = { 'c': 0, 'd': 1, 'e': 2, 'f': 3, 'g': 4, 'a': 5, 'b': 6 };
    }

    updateStaveNote() {

        this.nota = new StaveNote({ keys: this.keys, duration: this.duracion });
        if (this.dotted)
            this.nota.addDotToAll();

        if (this.selected && this.isRest())
            this.nota.setStyle({ fillStyle: 'rgba(0,100,200,1)' });

        if (this.playing)
            this.nota.setStyle({ fillStyle: 'red' });

        let count = 0;
        for (let i = 0; i < this.keys.length; i++) {
            if (this.keys[i].split('/')[1] > 4)
                count--;
            else
                count++;
        }

        if (count < 0)
            this.stem_dir = -1;
        else
            this.stem_dir = 1;

        let keys = this.sortKeys();
        const accidentalArray = Array.from(this.accidentals.keys());
        for (let i = 0; i < accidentalArray.length; i++) {
            let key = this.getKeyOfIndex(accidentalArray[i]);
            let index = keys.indexOf(key);
            this.nota.addModifier(new Accidental(this.accidentals.get(accidentalArray[i])), index);
        }


        if (this.text !== '')
            this.nota.addModifier(new Annotation(this.text), 0);

        this.nota.setStemDirection(this.stem_dir);

        this.sortArticulations();
        let shift_y = 0;
        for (let i = 0; i < this.articulations.length; i++) {
            let dir;
            let index = 0;
            if (this.articulations[i] !== 'a@a') {
                if (this.stem_dir === 1) {
                    dir = Modifier.Position.BELOW;
                    shift_y += 10;
                }
                else {
                    dir = Modifier.Position.ABOVE;
                    shift_y -= 10;
                    index = this.keys.length - 1;
                }
            }
            else {
                dir = Modifier.Position.ABOVE;
            }

            this.nota.addModifier(new Articulation(this.articulations[i]).setPosition(dir), index);
        }

    }

    updateX() {
        this.x = this.nota.getNoteHeadBeginX();
        this.w = this.nota.getNoteHeadEndX() - this.x;
    }

    calculaRec(y = 0) {
        let bound = this.nota.getBoundingBox();
        this.x = this.nota.getNoteHeadBeginX();
        this.updateX();

        if (this.isRest()) {
            this.h = bound.getH();
            this.y = bound.getY();
            return;
        }

        this.h = 10;
        this.y = y - 5;

    }

    getRec() {
        this.calculaRec();
        return new VexRec(
            this.x,
            this.y,
            this.w,
            this.h,
        );
    }

    getRecs() {
        //this.keys = this.sortKeys();
        let ys = this.nota.getYs();
        let recs = [];
        let keys = this.sortKeys();

        for (let i = ys.length - 1; i >= 0; i--) {
            this.calculaRec(ys[i]);
            recs.push([keys[i], new VexRec(
                this.x,
                this.y,
                this.w,
                this.h,
            )]);
        }
        return recs;
    }

    addDot() {
        this.dotted = true;
        return this;
    }

    hasDot() {
        return this.dotted;
    }

    removeDot() {
        this.dotted = false;
        return this;
    }

    getStaveNote() {
        this.updateStaveNote();
        return this.nota;
    };

    getStartY() {
        let keys = this.sortKeys();

        let y = Notacion.getNoteY(keys[keys.length - 1]);
        if (y != null) {
            if (this.articulations.indexOf('a@a') !== -1) {
                if (this.stem_dir === -1)
                    return y - 60;

            }

            return y - 35;

        }
        return 0;
    }

    getFinalY() {
        let keys = this.sortKeys();
        let y = Notacion.getNoteY(keys[0]);
        if (y != null) {
            if (this.stem_dir === 1) {
                return y + 35 + this.articulations.length * 5;
            }

            return y + 35;
        }
        return 0;
    }

    sortKeys() {
        let keys = [...this.keys];

        keys.sort((a, b) => {
            const numA = parseInt(a.split('/')[1]);
            const numB = parseInt(b.split('/')[1]);

            if (numA !== numB)
                return numA - numB;

            const letterA = a.split('/')[0];
            const letterB = b.split('/')[0];

            return this.notas_order[letterA] - this.notas_order[letterB];
        });

        return keys;
    }

    setSelected(key) {
        if (key === 'inicio') {
            let keys = this.sortKeys();
            this.key_selected = keys[0];
            this.selected = true;
            this.playNote();
            return keys[0];
        }

        if (this.keys.indexOf(key) === -1) {
            this.key_selected = '';
            this.selected = false;
            return ''
        }



        this.playNote();
        this.selected = true;
        this.key_selected = key;
        return key;
    }

    async playNote() {
        if (this.isPlaying || this.isRest() || !this.selected) return;
        this.isPlaying = true;
        await this.player.playNote(this);
        this.isPlaying = false;
    }

    isSelected() {
        return this.selected;
    }

    setKey(newKey) {
        if (this.isRest())
            this.duracion = this.duracion.replace('r', '');

        this.keys[this.keys.indexOf(this.key_selected)] = newKey;
        this.key_selected = newKey;
        this.playNote();
        return this;
    }

    setDuration(duration) {
        this.removeDot();
        this.duracion = duration;
        return this;
    }

    getDuration() {
        return this.duracion;
    }

    isRest() {
        return this.duracion.includes('r');
    }

    setAccidental(accidental, key) {
        if (this.isRest())
            return false;

        let index = this.keys.indexOf(key);
        if (!this.accidentals.has(index)) {
            this.accidentals.set(index, accidental);
            return true;
        }

        let prevAccidental = this.accidentals.get(index);
        if (prevAccidental === accidental) {
            this.accidentals.delete(index);
            return true;
        }

        this.accidentals.set(index, accidental);
        return true;
    }

    setArticulation(newArticulation) {
        if (this.isRest())
            return;
        let acumulables = [];
        acumulables.push('a-');
        acumulables.push('a>');
        acumulables.push('a@a');

        let index = this.articulations.indexOf(newArticulation);
        if (acumulables.indexOf(newArticulation) !== -1) {
            if (index !== -1) {
                this.articulations.splice(index, 1);
                return;
            }
            this.articulations.push(newArticulation);
            return;
        }

        let acortadores = [];
        acortadores.push(this.articulations.indexOf('a.'));
        acortadores.push(this.articulations.indexOf('av'));
        acortadores.push(this.articulations.indexOf('a^'));


        if (index !== -1) {
            this.articulations.splice(index, 1);
            return;
        }

        for (let i = 0; i < acortadores.length; i++) {
            if (acortadores[i] !== index) {
                this.articulations.splice(acortadores[i], 1);
            }
        }

        this.articulations.push(newArticulation);
    }

    addKey(key) {
        if (this.keys.indexOf(key) !== -1) {
            return '';
        }

        if (this.isRest()) {
            this.keys.pop();
            this.duracion = this.duracion.replace('r', '');
        }

        this.keys.push(key);
        this.key_selected = key;

        this.playNote();
        return key;
    }

    hasKey(key) {
        return this.keys.indexOf(key) !== -1;
    }

    getKeyOfIndex(index) {
        return this.keys[index];
    }

    getIndexOfKey(key) {
        return this.keys.indexOf(key);
    }

    convertToRest() {
        this.keys = [];
        this.keys.push('b/4');
        this.duracion += 'r';
        this.articulations = [];
        this.accidentals = new Map();
    }

    setDynamic(dynamic) {
        if (this.dynamic === dynamic) {
            this.dynamic = '';
            return;
        }

        this.dynamic = dynamic;
    }

    getDynamic() {
        return this.dynamic;
    }

    hasDynamic() {
        return this.dynamic !== -1;
    }

    setText(text) {
        this.text = text;
        return this;
    }

    sortArticulations() {
        const ordenArti = ['a>', 'a-', 'a.', 'av', 'a^', 'a@a'];

        this.articulations.sort((a, b) => {
            return ordenArti.indexOf(a) - ordenArti.indexOf(b);
        });
    }

    getModifiers() {
        return [...this.nota.getModifiers()];
    }

    isInTuplet() {
        return this.inTuplet;
    }

    getVexNote() {
        return this.nota;
    }

    getCopyNote() {
        return { ...this.nota };
    }

    getKeys() {
        return [...this.keys];
    }

    setInstrument(instrument){
        this.instrument = instrument;
        return this;
    }

    setClef(clef){
        this.clef = clef;
        return this;
    }

    getText(){
        return this.text;
    }

    getAccidentals(){
        return this.accidentals;
    }

    getArticulations(){
        return this.articulations;
    }
};

//1 redonda
//2 blanca
//4 regra
//8 corchea
//16 semicorchea
//32 fusa
//64 semifusa
//128 cuartifusa