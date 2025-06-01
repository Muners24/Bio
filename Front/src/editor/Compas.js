//Stave
import { Stave, StaveTempo, Clef, KeySignature, Barline, Formatter, TextDynamics, Voice } from 'vexflow';

import VexRec from './VexRec';
import Nota from './Nota';
import Notacion from './Notacion';
//clefs:
//treble  bass  alto  tenor  percussion
export default class Compas extends VexRec {
    constructor(timeNum = 4, timeDen = 4, instrument) {
        super(50, 0, 0, 80);
        this.instrument = instrument;
        this.clef = '';
        this.keySignature = '';
        this.tempo = 120;

        this.timeNum = timeNum;
        this.timeDen = timeDen;
        this.notas = [];
        
        this.tuplets = [];
        this.staveNotes = [];
        this.keySignature_sel = false;
        this.clef_sel = false;

        this.timeSignature = this.timeNum.toString() + "/" + this.timeDen.toString();

        this.tempo_visibility = false;
        this.timeSignature_visibility = false;
        this.keySignature_visibility = false;
        this.stave;
        this.initSilencios();
        this.updateSize();

    }

    getTimeDen() {
        return this.timeDen;
    }

    getTimeNum() {
        return this.timeNum;
    }

    setTimeNum(num) {
        this.timeNum = num;
        this.timeSignature = String(this.timeNum) + "/" + String(this.timeDen);
        return this;
    }

    setTimeDen(den) {
        this.timeDen = den;
        this.timeSignature = String(this.timeNum) + "/" + String(this.timeDen);
        return this;
    }

    initSilencios() {
        for (let i = 0; i < this.timeNum; i++) {
            this.addNota(['b/4'], this.timeDen.toString() + 'r');
        }
    }

    addNota(keys = [], duracion = "4") {
        let nota = new Nota(keys, duracion, this.instrument,this.clef);
        this.notas.push(nota);
    }

    updateStave() {
        this.stave = new Stave(this.x, this.y, this.w);

        if (this.clef != '')
            this.stave.addClef(this.clef);

        if (this.timeSignature_visibility) {
            this.stave.addTimeSignature(this.timeSignature);
        }

        if (this.tempo_visibility) {
            this.stave.addModifier(new StaveTempo({ duration: String(this.timeDen), dots: 0, bpm: this.tempo }, 0, -10).setXShift(55));
        }

        if (this.keySignature_visibility) {
            if (this.keySignature != 'C')
                this.stave.addKeySignature(this.keySignature);
            else
                this.stave.addKeySignature('G');
        }

        let mod = this.stave.getModifiers();

        for (let i = 0; i < mod.length; i++) {
            if (mod[i] instanceof Clef) {
                if (this.clef_sel)
                    mod[i].setStyle({ fillStyle: 'rgba(0,100,200,1)' });

            } else if (mod[i] instanceof KeySignature) {
                if (this.keySignature_sel) {
                    if (this.keySignature === 'C')
                        mod[i].setStyle({ fillStyle: 'rgba(0,100,200,0.5)' });
                    else
                        mod[i].setStyle({ fillStyle: 'rgba(0,100,200,1)' });
                } else {
                    if (this.keySignature === 'C')
                        mod[i].setStyle({ fillStyle: 'rgba(0,0,0,0.3)' });
                }

            } else if (mod[i] instanceof StaveTempo) {
                mod[i].setX(
                    - this.getClefRec().getW()
                    - this.getKeySignatureRec().getW()
                    - this.getTimeNumRec().getW());
            }
        }
    }

    draw(context, is_final) {
        this.updateStave();

        if (is_final)
            this.stave.setEndBarType(Barline.type.END);

        let notasDynamic = [];
        this.stave.setContext(context).draw();
        this.staveNotes = [];

        for (let i = 0; i < this.notas.length; i++) {
            this.staveNotes.push(this.notas[i].getStaveNote());
            if (this.notas[i].hasDynamic())
                notasDynamic.push(this.notas[i]);

        }

        Formatter.FormatAndDraw(context, this.stave, this.staveNotes, { autoBeam: true });

        for (let i = 0; i < this.tuplets.length; i++) {
            this.tuplets[i].draw(context);
        }

        if (notasDynamic.length !== 0) {
            for (let i = 0; i < notasDynamic.length; i++) {
                let strDynamic = notasDynamic[i].getDynamic();
                let shiftX = 0;
                if (strDynamic.includes('m'))
                    shiftX = -3;

                let temp_compas = new Stave(notasDynamic[i].getX() - 42 + shiftX, this.getY() + this.getH() * 1.2, notasDynamic[i].getW());
                let dynamic = new TextDynamics({ text: strDynamic, duration: notasDynamic[i].getDuration() });
                Formatter.FormatAndDraw(context, temp_compas, [dynamic]);
            }
        }
    }

    addClef(clef) {
        this.clef = clef;
        return this;
    }

    getClef() {
        return this.clef;
    }

    removeClef() {
        this.clef = '';
        return this;
    }

    setKeySignature(keySignature) {
        this.keySignature = keySignature;
        return this;
    }

    getKeySignature() {
        if (this.keySignature === 'C')
            return 'G';

        return this.keySignature;
    }

    addTimeSignature(timeNum, timeDen) {
        this.timeNum = timeNum;
        this.timeDen = timeDen;
        this.timeSignature = this.timeNum.toString() + "/" + this.timeDen.toString();
        return this;
    }

    getTimeSignature() {
        return this.timeSignature;
    }

    removeTimeSignature() {
        this.timeSignature = '';
        return this;
    }

    updateSize() {
        this.w = this.notas.length * 50;

        if (this.clef != '')
            this.w += 50;

        if (this.timeSignature != '')
            this.w += 50;

        if (this.keySignature != '')
            this.w += 50;
    }

    getMinY() {
        let min_note_y = this.notas[0].getStartY();
        for (let i = 1; i < this.notas.length; i++) {
            if (min_note_y > this.notas[i].getStartY())
                min_note_y = this.notas[i].getStartY();
        }

        if (min_note_y < 0)
            return this.getY() + min_note_y;

        return this.getY();
    }

    getOverY() {
        let min_note_y = this.notas[0].getStartY();
        for (let i = 1; i < this.notas.length; i++) {
            if (min_note_y > this.notas[i].getStartY())
                min_note_y = this.notas[i].getStartY();
        }
        if (min_note_y < 0)
            return min_note_y * -1;

        return 0;
    }

    getFinalY() {
        let max_note_y = this.notas[0].getFinalY();
        for (let i = 1; i < this.notas.length; i++) {
            if (max_note_y < this.notas[i].getFinalY())
                max_note_y = this.notas[i].getFinalY();
        }

        let final_compas = this.getY() + this.getH() / 2;

        if (max_note_y > this.getH())
            return final_compas + max_note_y;

        return final_compas + this.getH();
    }

    getClefRec() {
        return new VexRec(
            this.getX(),
            this.getY() + this.getH() / 2 - 15,
            35,
            this.getH() * 0.9
        );
    }

    getKeySignatureRec() {
        let clef_rec = this.getClefRec();
        return new VexRec(
            clef_rec.getFinalX(),
            clef_rec.getY(),
            Notacion.getKeySignatureW(this.keySignature),
            clef_rec.getH()
        );
    }

    getTimeNumRec() {
        let keyS_rec = this.getKeySignatureRec();
        let w = 32;
        if (this.timeNum > 10 || this.timeDen > 10) {
            w += 12;
        }

        return new VexRec(
            keyS_rec.getFinalX(),
            keyS_rec.getY() + keyS_rec.getH() / 2,
            w,
            keyS_rec.getH() / 2
        );
    }

    getTimeDenRec() {
        let keyS_rec = this.getKeySignatureRec();
        let w = 32;
        if (this.timeNum > 10 || this.timeDen > 10) {
            w += 12;
        }
        return new VexRec(
            keyS_rec.getFinalX(),
            keyS_rec.getY(),
            w,
            keyS_rec.getH() / 2
        );
    }

    setSelectClef(value) {
        this.clef_sel = value;
        return value;
    }

    setSelectKeySign(value) {
        this.keySignature_sel = value;
        return value;
    }


    selectTime() {
        this.keySignature_sel = false;
        this.clef_sel = false;
    }

    selectKeySign() {
        this.keySignature_sel = true;
        this.clef_sel = false;
    }

    noSignSelected() {
        this.keySignature_sel = false;
        this.clef_sel = false;
    }

    setTempo(tempo) {
        this.tempo = tempo;
        return this;
    }

    getRec() {
        return new VexRec(
            this.getX(),
            this.getMinY(),
            this.getW(),
            this.getFinalY() - this.getMinY()
        );
    }

    setClef(clef) {
        this.clef = clef;
        for(let i=0;i<this.notas.length;i++){
            this.notas[i].setClef(this.clef);
        }
        return this;
    }

    setInstrument(instrument){
        this.instrument = instrument;
         for(let i=0;i<this.notas.length;i++){
            this.notas[i].setInstrument(this.clef);
        }
        return this;
    }

    removeTuplet(index) {
        let noteIndex = this.notas.indexOf(this.tuplets[index].getFirstNoteIndex());
        let nota = this.notas[noteIndex];
        nota.setDuration(String(parseInt(nota.getDuration()) / 2));
        this.notas.splice(noteIndex + 1, 2);
        this.tuplets.splice(index, 1);
        nota.inTuplet = false;
        return nota.getKeyOfIndex(0);
    }

    getTempo() {
        return this.tempo;
    }

    empty() {
        this.notas = [];
        this.staveNotes = [];
        this.tuplets = [];
        this.keySignature_sel = false;
        this.clef_sel = false;
    }

    getTempoVisibility() {
        return this.tempo_visibility;
    }

    getTimeSignatureVisibility() {
        return this.timeSignature_visibility;
    }

    getKeySignatureVisibility() {
        return this.keySignature_visibility;
    }

    setTempoVisibility(visibility) {
        this.tempo_visibility = visibility;
        return this;
    }

    setTimeSignatureVisibility(visibility) {
        this.timeSignature_visibility = visibility;
        return this;
    }

    setKeySignatureVisibility(visibility) {
        this.keySignature_visibility = visibility;
        return this;
    }

    getStave() {
        return this.stave;
    }
}