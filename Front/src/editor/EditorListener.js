import { Renderer, Stave, StaveNote, Fraction } from 'vexflow';

import Notacion from './Notacion';
import Nota from './Nota';
import VexRec from './VexRec';
import VexTuplet from './VexTuplet';
import instruments from './Instruments';
import { faL } from '@fortawesome/free-solid-svg-icons';

export default class EditorListener {
    constructor(canvas) {
        this.canvas = document.getElementById(canvas);
        this.render = new Renderer(this.canvas, Renderer.Backends.CANVAS);
        this.bordeR = window.innerWidth - 150;
        this.render.resize(this.bordeR, 200);
        this.context = this.render.getContext();

        this.rec = this.canvas.getBoundingClientRect();
        this.voice_selected = null;
        this.nota_selected = -1;
        this.compas_selected = -1;
        this.penta_selected = -1;
        this.key_selected = '';

        this.formated = false;

        this.temp_compas = null;
        this.temp_nota = null;

        this.prevCompas_selected = -1;
        this.prevNota_selected = -1;
        this.prevPenta_selected = -1;
        this.cresc = false;

        this.initialized = false;
        this.crescendos = new Map();

        this._handleClick = this.handleClick.bind(this);
        this._handleMousemove = this.handleMov.bind(this);
        this._handleKeydown = this.handleKeydown.bind(this);
        this._debouncedKeydown = this.debounce(this.handleKeydown, 16);

    }

    initInput() {
        if (this.initialized) return;
        this.initialized = true;

        document.addEventListener('click', (event) => this.handleClick(event));

        this.canvas.addEventListener('mousemove', (event) => {
            if (this.nota_selected !== -1) {
                this.debounce(this.handleMov.bind(this), 60)(event);
            }
        });

        document.addEventListener('keydown', (event) => {
            if (this.voice_selected)
                event.preventDefault();
        });

        document.addEventListener('keydown', this.debounce(this.handleKeydown.bind(this), 16));
    }

    destroy() {
        if (!this._initialized) return;
        this._initialized = false;

        document.removeEventListener('click', this._handleClick);
        document.removeEventListener('keydown', this._debouncedKeydown);
        this.canvas.removeEventListener('mousemove', this._handleMousemove);
    }

    debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    handleMov(event) {
        if (this.isPlaying)
            return;

        if (this.compas_selected === -1)
            return;

        const x = event.pageX - this.rec.left;
        const y = event.pageY - this.rec.top;

        let compas = this.voice_selected.pentagramas[this.penta_selected].compases[this.compas_selected];

        this.context.setFillStyle('rgba(0,0,0,0.5)');
        let rec = new VexRec(
            compas.notas[this.nota_selected].getX(),
            compas.getMinY(),
            10,
            compas.getFinalY() - compas.getMinY()
        );

        if (!rec.collisionPoint(x, y)) {
            if (this.temp_nota !== null) {
                this.temp_compas = null;
                this.temp_nota = null;
                this.Editdraw();
            }
            return;
        }

        let nota = compas.notas[this.nota_selected];

        this.temp_compas = new Stave(
            nota.getX() - 17,
            compas.getY(),
            nota.getW());

        this.noteRec = new VexRec(
            nota.getX(),
            compas.getY(),
            nota.getW(),
            compas.getFinalY() - compas.getMinY()
        );

        let key = Notacion.getNoteOnY(compas.getMinY() + compas.getOverY(), y);
        let dur = parseInt(nota.getDuration());
        this.temp_nota = new StaveNote({ keys: [key], duration: String(dur) });
        this.temp_nota.setStyle({
            fillStyle: 'rgba(0,100,200,1)', strokeStyle: 'rgba(0,0,0,0.0)',
            shadowColor: 'rgba(0,0,0,0.0)', shadowBlur: 'rgba(0,0,0,0.0)'
        });

        if (nota.hasDot())
            this.temp_nota.addDotToAll();

        this.temp_nota.setStyle({
            fillStyle: 'rgba(0,100,200,1)', strokeStyle: 'rgba(0,0,0,0.0)'
        });

        this.temp_nota.setBeam();

        this.Editdraw();
    }

    handleKeydown(event) {
        const target = document.activeElement;
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
        ) {
            return;
        }


        if (this.isPlaying)
            return;

        this.temp_compas = null;
        this.temp_nota = null;
        switch (event.code) {
            case 'KeyA':
                this.selectLeft();
                this.Editdraw();
                break;
            case 'KeyD':
                this.selectRight();
                this.Editdraw();
                break;
            case 'KeyW':
                this.formated = false;
                this.switchKeySign(Notacion.getNextKeySignature.bind(Notacion));
                this.switchPitch(Notacion.getNextNote.bind(Notacion));
                this.switchClef(Notacion.getNextClef.bind(Notacion));
                this.Editdraw();
                break;
            case 'KeyS':
                this.formated = false;
                this.switchKeySign(Notacion.getPreviousKeySignature.bind(Notacion));
                this.switchPitch(Notacion.getPreviusNote.bind(Notacion));
                this.switchClef(Notacion.getPreviusClef.bind(Notacion));
                this.Editdraw();
                break;
            case 'Period':
                this.addDot();
                break;
            case 'KeyV':
                this.setAccidental('bb');
                break;
            case 'KeyB':
                this.setAccidental('b');
                break;
            case 'KeyN':
                this.setAccidental('n');
                break;
            case 'KeyM':
                this.setAccidental('#');
                break;
            case 'Comma':
                this.setAccidental('##');
                break;
            case 'KeyF':
                this.setArticulation('a.');
                break;
            case 'KeyG':
                this.setArticulation('av');
                break;
            case 'KeyH':
                this.setArticulation('a^');
                break;
            case 'KeyJ':
                this.setArticulation('a>');
                break;
            case 'KeyK':
                this.setArticulation('a-');
                break;
            case 'KeyL':
                this.setArticulation('a@a');
                break;
            case 'Slash':
                this.removeCompas();
                break;
            case 'BracketRight':
                this.addCompas();
                break;
            case 'Backspace':
            case 'KeyR':
                this.setRest();
                break;
            case 'KeyT':
                this.setDynamic('pp');
                break;
            case 'KeyY':
                this.setDynamic('p');
                break;
            case 'KeyU':
                this.setDynamic('mp');
                break;
            case 'KeyI':
                this.setDynamic('mf');
                break;
            case 'KeyO':
                this.setDynamic('f');
                break;
            case 'KeyP':
                this.setDynamic('ff');
                break;
            case 'Digit0':
                this.setTriplet();
                break;
            case 'Digit8':
                this.setCrescendo();
                break;
            case 'Backquote':
                this.prevVoice();
                break;
            case 'Tab':
                this.nextVoice();
                break;
            case 'KeyX':
                this.play();
                this.isPlaying = true;
                break;
            case 'KeyZ':
                this.addVoice('voz', { ...instruments[19] });
                this.formated = false
                this.Editdraw();
                break;
            default:
        }

        const durationRegex = /^[1-7]$/;
        if (durationRegex.test(event.key)) {
            this.setRithm(event.key);
        }
    }

    handleClick(event) {
        if (this.isPlaying)
            return;

        const x = event.pageX - this.rec.left;
        const y = event.pageY - this.rec.top;

        let finded = false;
        for (let i = 0; i < this.voices.length; i++) {
            for (let j = 0; j < this.voices[i].pentagramas.length; j++) {
                let rec = this.voices[i].pentagramas[j].getRec();
                if (rec.collisionPoint(x, y)) {
                    if (this.voice_selected !== this.voices[i]) {
                        this.noteDeselect();
                    }
                    this.voice_selected = this.voices[i];
                    this.penta_selected = j

                    finded = true;
                    break;
                }
            }
            if (finded)
                break;
        }

        if (!finded) {
            this.noteDeselect();
            this.signDeselect();
            this.Editdraw();
            return;
        }

        let clefSelected = false;
        let keySignSelected = false;

        for (let i = 0; i < this.voice_selected.pentagramas.length; i++) {
            let inicial = this.voice_selected.pentagramas[i].compases[0];
            if (inicial.setSelectClef(inicial.getClefRec().collisionPoint(x, y))) {
                clefSelected = true;
            }

            if (inicial.setSelectKeySign(inicial.getKeySignatureRec().collisionPoint(x, y))) {
                keySignSelected = true;
            }
        }

        if (clefSelected || keySignSelected) {
            if (this.nota_selected !== -1) {
                this.noteDeselect();
            }

            this.Editdraw();
            return;
        }

        if (this.temp_nota !== null) {
            let compas = this.voice_selected.pentagramas[this.penta_selected].compases[this.compas_selected];
            if (!compas.notas[this.nota_selected].hasKey(this.temp_nota.getKeys()[0])) {
                this.key_selected = compas.notas[this.nota_selected].addKey(this.temp_nota.getKeys()[0]);
            }
            else {
                this.key_selected = this.temp_nota.getKeys()[0];
                compas.notas[this.nota_selected].setSelected(this.key_selected);
                console.log(String(this.key_selected));
            }
            this.signDeselect();
            this.formated = false;
            this.Editdraw();
            return;
        }

        let compas_finded = false;
        for (let i = 0; i < this.voice_selected.pentagramas[this.penta_selected].compases.length; i++) {
            let compas = this.voice_selected.pentagramas[this.penta_selected].compases[i];
            let rec_comp = compas.getRec();
            if (rec_comp.collisionPoint(x, y)) {
                this.compas_selected = this.voice_selected.pentagramas[this.penta_selected].compases.indexOf(compas);
                compas_finded = true;
            }
        }

        if (!compas_finded) {
            this.noteDeselect();
            this.signDeselect();
            this.Editdraw();
            return;
        }

        if (this.nota_selected !== -1) {
            let compas = this.voice_selected.pentagramas[this.penta_selected].compases[this.compas_selected];
            compas.notas[this.nota_selected].setSelected(-1);
        }

        let noteHeadRecs = [];
        let compas = this.voice_selected.pentagramas[this.penta_selected].compases[this.compas_selected];
        for (let i = 0; i < compas.notas.length; i++) {

            let nota_rec = null;
            if (compas.notas[i].isRest()) {
                nota_rec = compas.notas[i].getRec();
                if (nota_rec.collisionPoint(x, y)) {
                    this.nota_selected = i;
                    this.key_selected = compas.notas[i].getKeys()[0];
                }
            }
            else {
                nota_rec = new VexRec(
                    compas.notas[i].getX(),
                    compas.getMinY(),
                    10,
                    compas.getFinalY() - compas.getMinY());

                if (nota_rec.collisionPoint(x, y)) {
                    noteHeadRecs = compas.notas[i].getRecs();
                    this.nota_selected = i;
                }
            }

        }

        for (let i = 0; i < noteHeadRecs.length; i++) {
            if (noteHeadRecs[i][1].collisionPoint(x, y)) {
                this.key_selected = noteHeadRecs[i][0];
            }
        }

        if (this.key_selected === '') {
            this.noteDeselect();
            this.signDeselect();
            this.Editdraw();
            return;
        }

        this.key_selected = compas.notas[this.nota_selected].setSelected(this.key_selected);
        this.Editdraw();
    }

    selectRight() {
        this.temp_compas = null;
        this.temp_nota = null;

        if (this.voice_selected === null) {
            this.voice_selected = this.voices[0];
        }

        let inicial = this.voice_selected.compases[0];
        if (inicial.clef_sel) {
            inicial.selectKeySign();
            this.noteDeselect();
            return;
        }

        if (inicial.keySignature_sel) {
            inicial.noSignSelected();
            this.compas_selected = 0;
            this.nota_selected = 0;
            this.penta_selected = 0;
            this.key_selected = inicial.notas[0].setSelected('inicio');
            return;
        }

        if (this.nota_selected !== -1) {
            let compas = this.voice_selected.pentagramas[this.penta_selected].compases[this.compas_selected];
            compas.notas[this.nota_selected].setSelected('');
            if (this.nota_selected < compas.notas.length - 1) {
                this.nota_selected++;
                this.key_selected = compas.notas[this.nota_selected].setSelected('inicio');
                return;
            }

            let pentagrama = this.voice_selected.pentagramas[this.penta_selected];
            if (this.compas_selected < pentagrama.compases.length - 1) {
                this.compas_selected++;
                this.nota_selected = 0;
                let newCompas = pentagrama.compases[this.compas_selected];
                this.key_selected = newCompas.notas[this.nota_selected].setSelected('inicio');
                return;
            }

            if (this.penta_selected < this.voice_selected.pentagramas.length - 1) {
                this.penta_selected++;
                this.compas_selected = 0;
                this.nota_selected = 0;
                let newCompas = this.voice_selected.pentagramas[this.penta_selected].compases[this.compas_selected];
                this.key_selected = newCompas.notas[this.nota_selected].setSelected('inicio');
                return;
            }

            this.key_selected = compas.notas[this.nota_selected].setSelected('inicio');
            return;
        }

        inicial.setSelectClef(true);
    }

    selectLeft() {
        if (this.voice_selected === null) {
            this.voice_selected = this.voices[0];
        }

        let inicial = this.voice_selected.compases[0];
        if (inicial.clef_sel)
            return;

        if (inicial.keySignature_sel) {
            inicial.setSelectClef(true);
            this.noteDeselect();
            return;
        }

        if (this.nota_selected !== -1) {
            let compas = this.voice_selected.pentagramas[this.penta_selected].compases[this.compas_selected];
            compas.notas[this.nota_selected].setSelected('');
            if (this.nota_selected > 0) {
                this.nota_selected--;
                this.key_selected = compas.notas[this.nota_selected].setSelected('inicio');
                return;
            }

            if (this.compas_selected > 0) {
                this.compas_selected--;
                let newCompas = this.voice_selected.pentagramas[this.penta_selected].compases[this.compas_selected];
                this.nota_selected = newCompas.notas.length - 1;
                this.key_selected = newCompas.notas[this.nota_selected].setSelected('inicio');
                return;
            }

            if (this.penta_selected > 0) {
                this.penta_selected--;
                let newPenta = this.voice_selected.pentagramas[this.penta_selected];
                this.compas_selected = newPenta.compases.length - 1;
                let newCompas = this.voice_selected.pentagramas[this.penta_selected].compases[this.compas_selected];
                this.nota_selected = newCompas.notas.length - 1;
                this.key_selected = newCompas.notas[this.nota_selected].setSelected('inicio');
                return;
            }

            inicial.selectKeySign();
            this.noteDeselect();
            return;
        }

        inicial.setSelectClef(true);
    }

    noteDeselect() {
        if (this.nota_selected === -1)
            return;

        this.temp_compas = null;
        this.temp_nota = null;

        let compas = this.voice_selected.pentagramas[this.penta_selected].compases[this.compas_selected];
        compas.notas[this.nota_selected].setSelected(-1);
        this.nota_selected = -1;
        this.compas_selected = -1;
        this.penta_selected = -1;
        this.key_selected = '';
        this.voice_selected = null;
    }

    signDeselect() {
        if (!this.voice_selected)
            return;
        this.voice_selected.compases[0].noSignSelected();
    }

    switchPitch(switchP) {
        if (this.nota_selected === -1)
            return;

        let compas = this.voice_selected.pentagramas[this.penta_selected].compases[this.compas_selected];
        let nota = compas.notas[this.nota_selected];
        let newKey = switchP(this.key_selected);
        while (newKey !== null && nota.hasKey(newKey)) {
            newKey = switchP(newKey);
        }

        if (newKey === null)
            return;

        nota.setKey(newKey);
        this.key_selected = newKey;
    }

    switchKeySign(switchKey) {
        if (this.voice_selected === null)
            return;

        let inicial = this.voice_selected.compases[0];
        if (inicial.keySignature_sel) {
            inicial.keySignature = switchKey(inicial.keySignature);
            return;
        }
    }

    switchClef(switchClf) {
        if (this.voice_selected === null)
            return;

        let inicial = this.voice_selected.compases[0];
        if (inicial.clef_sel) {
            inicial.setClef(switchClf(inicial.clef));
            this.voice_selected.setClef(inicial.clef);
        }
    }

    setRithm(durationNumber) {
        if (this.nota_selected === -1)
            return;

        let exp = parseInt(durationNumber) - 1;
        let duration = String(2 ** exp);

        let voice = this.voice_selected;
        let compas = voice.pentagramas[this.penta_selected].compases[this.compas_selected];
        let prevDuration = compas.notas[this.nota_selected].getDuration();

        if (this.compasAdjustRithm(compas, duration, prevDuration)) {
            if (prevDuration.includes('r'))
                compas.notas[this.nota_selected].setDuration(duration + 'r');
            else
                compas.notas[this.nota_selected].setDuration(duration);
        }
        this.formated = false;
        this.Editdraw();
    }

    //continuar con la division de notas:
    compasAdjustRithm(compas, duration, prevDuration) {
        let intPrevDuration = parseInt(prevDuration);
        let intDuration = parseInt(duration);

        //si las duraciones son iguales pero tiene puntillo, se le quita
        if (intDuration === intPrevDuration) {
            if (compas.notas[this.nota_selected].hasDot()) {
                this.removeDot();
                return true;
            }
            return false;
        }

        //si la duracion es mayor a la capacidad del compas se anula el cambio
        if (1 / intDuration > compas.getTimeNum() / compas.getTimeDen())
            return false;

        //si la duracion es menor a la duracion anterior se dividira
        if (1 / intDuration < 1 / intPrevDuration) {
            if (compas.notas[this.nota_selected].hasDot())
                this.removeDot();
            let silencios = intDuration / intPrevDuration - 1;
            let instrument = compas.instrument;
            let clef = compas.clef;
            let nuevosSilencios = Array.from({ length: silencios }, () => new Nota(['b/4'], duration + 'r', instrument, clef));
            compas.notas.splice(this.nota_selected + 1, 0, ...nuevosSilencios);
            return true;
        }

        //la duracion es mayor o igual que la duracion anterior
        //se debe comprobar la duracion restante del compas (contando la nota seleccionada)
        let resDuration = 1 / intPrevDuration;
        if (compas.notas[this.nota_selected].hasDot())
            resDuration += (1 / (parseInt(compas.notas[this.nota_selected].getDuration()) * 2));

        for (let i = this.nota_selected + 1; i < compas.notas.length; i++) {
            resDuration += 1 / parseInt(compas.notas[i].getDuration());
        }

        //si la duracion es mayor que la duracion restante del compas se anula
        if (1 / intDuration > resDuration)
            return false;


        if (compas.notas[this.nota_selected].hasDot())
            this.removeDot();


        //la nota atropellara a otras notas
        //se calcula el excedente que atropella a otras notas
        let durFrac = new Fraction(1, intDuration);
        let prevDurFrac = new Fraction(1, intPrevDuration);

        let excessFrac = durFrac.subtract(prevDurFrac);
        //let excessDur = 1 / intDuration - 1 / intPrevDuration;
        this.fixOverlapNotes(compas, this.nota_selected + 1, excessFrac)
        return true;
    }

    fixOverlapNotes(compas, indexNote, excessFrac) {
        for (let i = indexNote; i < compas.notas.length; i++) {

            let currentDur = new Fraction(1, parseInt(compas.notas[i].getDuration()));
            //si el exedente es igual a la duracion acual, le hace pop
            if (excessFrac.equals(currentDur)) {
                compas.notas.splice(i, 1);
                return;
            }

            //si el exedente es mayor o igual a la duracion actual, le hace pop
            //y se ajusta el exedente
            if (excessFrac.greaterThanEquals(currentDur)) {
                compas.notas.splice(i, 1);
                excessFrac.subtract(currentDur);
                i--;
                continue;
            }

            //si no las cubre totalmente
            //entonces su ritmo debe ser dividido
            this.biteNote(compas, i, excessFrac);
            return;
        }
    }

    /*********************************************************************************************/
    //este metodo debe ligar las notas generadas
    //aun esta implementado la ligadura
    /************************************************************************************************/
    biteNote(compas, i, biteFraction) {
        let currentDur = new Fraction(1, parseInt(compas.notas[i].getDuration()));
        let restRitmo = currentDur.subtract(biteFraction);

        while (restRitmo.numerator !== 0) {
            restRitmo.simplify();
            let instrument = compas.instrument;
            let clef = compas.clef;
            if (compas.notas[i].isRest())
                compas.notas.splice(i + 1, 0, new Nota(['b/4'], String(restRitmo.denominator) + 'r', instrument,clef));
            else
                compas.notas.splice(i + 1, 0, new Nota(
                    [...compas.notas[i].keys.slice()],
                    String(restRitmo.denominator)),
                    instrument,
                    clef);

            restRitmo.subtract(new Fraction(1, restRitmo.denominator));
        }
        compas.notas.splice(i, 1);
    }

    //si el puntillo es valido, se acomoda todo el compas
    //usando los mismos metodos que al cambiar de ritmo
    //se debe diferenciar del metodo addDot de la clase Nota
    addDot() {
        if (this.nota_selected === -1)
            return;
        let voice = this.voice_selected;
        let compas = voice.pentagramas[this.penta_selected].compases[this.compas_selected];
        if (compas.notas[this.nota_selected].hasDot())
            return;

        let resDuration = new Fraction(0, 1);
        for (let i = this.nota_selected + 1; i < compas.notas.length; i++) {
            resDuration += new Fraction(1, parseInt(compas.notas[i].getDuration()));
        }
        //si el dot no cabe, no se hace nada
        let dotDuration = new Fraction(1, parseInt(compas.notas[this.nota_selected].getDuration()));
        dotDuration.divide(2);
        if (dotDuration.greaterThan(resDuration))
            return;

        //cabe, entonces se sobrepone a las siguientes notas
        compas.notas[this.nota_selected].addDot();
        this.fixOverlapNotes(compas, this.nota_selected + 1, dotDuration);

        this.formated = false;
        this.Editdraw();
    }

    //remueve el puntillo y agrega un silencio en su lugar
    //se usa cuando el ritmo de la nota cambia o cuando se elimina el puntillo
    //se debe diferenciar del metodo removeDot de la clase Nota
    removeDot() {
        if (this.nota_selected === -1)
            return;

        let voice = this.voice_selected;
        let compas = voice.pentagramas[this.penta_selected].compases[this.compas_selected];
        compas.notas[this.nota_selected].removeDot();
        let duration = parseInt(compas.notas[this.nota_selected].getDuration()) * 2;
        let instrument = compas.instrument;
        let clef = compas.clef;
        compas.notas.splice(this.nota_selected + 1, 0, new Nota(['b/4'], String(duration) + 'r', instrument,clef))
    }

    setAccidental(accidental) {
        if (this.nota_selected === -1)
            return;
        let voice = this.voice_selected;
        let compas = voice.pentagramas[this.penta_selected].compases[this.compas_selected];
        if (compas.notas[this.nota_selected].setAccidental(accidental, this.key_selected)) {
            this.formated = false;
            this.Editdraw();
        }
    }

    setArticulation(articulation) {
        if (this.nota_selected === -1)
            return;
        let voice = this.voice_selected
        let compas = voice.pentagramas[this.penta_selected].compases[this.compas_selected];
        compas.notas[this.nota_selected].setArticulation(articulation);
        this.Editdraw();
    }

    addTie() {

    }

    cutCompas(numerator, denominator) {
        for (let k = 0; k < this.voices.length; k++) {
            let voice = this.voices[k];
            for (let i = 0; i < voice.compases.length; i++) {
                let cutFrac = new Fraction(numerator, denominator);
                let compas = voice.compases[i];
                for (let j = 0; j < compas.notas.length; j++) {
                    let currentDur = new Fraction(1, parseInt(compas.notas[j].getDuration()));
                    if (cutFrac.greaterThanEquals(currentDur)) {
                        cutFrac.subtract(currentDur);
                        continue;
                    }

                    if (cutFrac.numerator === 0) {
                        compas.notas.splice(j, 1);
                        j--;
                        continue;
                    }

                    this.biteNote(compas, j, cutFrac);
                    cutFrac.subtract(cutFrac);
                }
            }
        }
    }

    incresCompasNum(numerator, denominator) {
        let compas = this.vocies[0].compases[0];
        let extraNum = numerator - compas.getTimeNum();

        for (let k = 0; k < this.voices.length; k++) {
            let voice = this.voices[k]
            for (let i = 0; i < voice.compases.length; i++) {
                let j = 0;
                while (j < extraNum) {
                    voice.compases[i].addNota(['b/4'], String(denominator) + 'r');
                    j++;
                }
            }
        }

    }

    setCompasNum(num) {
        let compas = voices[0].compases[0];
        let prevNum = compas.getTimeNum();

        if (prevNum === num)
            return;

        if (this.nota_selected !== -1)
            this.noteDeselect();

        this.signDeselect();

        if (prevNum > num)
            this.cutCompas(num, compas.getTimeDen());
        else
            this.incresCompasNum(num, compas.getTimeDen());

        compas.setTimeNum(num);
        this.formated = false;
        this.Editdraw();
        return;
    }

    decreaseCompasDen(numerator, denominator) {
        let prevDen = this.voices[0].compases[0].getTimeDen();

        for (let k = 0; k < this.voices.length; k++) {
            let voice = this.voices[k];
            for (let i = 0; i < voice.compases.length; i++) {
                let compas = voice.compases[i];
                let extraFrac = new Fraction(numerator, denominator);
                extraFrac.subtract(new Fraction(numerator, prevDen));

                while (extraFrac.numerator !== 0) {
                    extraFrac.simplify();
                    compas.addNota(['b/4'], String(extraFrac.denominator) + 'r');
                    extraFrac.subtract(new Fraction(1, extraFrac.denominator));
                }
            }
        }

    }

    setCompasDen(den) {
        let compas = this.voices[0].compases[0];
        let prevDen = compas.getTimeDen();

        if (prevDen === den)
            return;

        if (this.nota_selected !== -1)
            this.noteDeselect();

        this.signDeselect();

        if (prevDen > den)
            this.decreaseCompasDen(compas.getTimeNum(), den);
        else
            this.cutCompas(compas.getTimeNum(), den);

        compas.setTimeDen(den);
        this.formated = false;
        this.Editdraw();
        return;
    }

    setRest() {
        if (this.nota_selected === -1)
            return;

        let voice = this.voice_selected;
        let compas = voice.pentagramas[this.penta_selected].compases[this.compas_selected];
        if (compas.notas[this.nota_selected].isRest())
            return;

        compas.notas[this.nota_selected].convertToRest();
        this.formated = false;
        this.Editdraw();
    }

    setDynamic(dynamic) {
        if (this.nota_selected === -1)
            return;
        let voice = this.voice_selected;
        let compas = voice.pentagramas[this.penta_selected].compases[this.compas_selected];
        compas.notas[this.nota_selected].setDynamic(dynamic);
        this.Editdraw();
    }

    setText(text) {
        if (this.nota_selected === -1)
            return;
        let voice = this.voice_selected;
        let compas = voice.pentagramas[this.penta_selected].compases[this.compas_selected];
        compas.notas[this.nota_selected].setText(text);
        this.formated = false;
        this.Editdraw();
    }

    setTriplet() {
        if (this.nota_selected === -1)
            return;

        let voice = this.voice_selected;
        let compas = voice.pentagramas[this.penta_selected].compases[this.compas_selected];
        let nota = compas.notas[this.nota_selected];

        if (nota.isInTuplet()) {
            for (let i = 0; i < compas.tuplets.length; i++) {
                if (compas.tuplets[i].hasNote(nota)) {
                    this.key_selected = compas.removeTuplet(i);
                    this.nota_selected = i
                    break;
                }
            }
            this.formated = false;
            this.Editdraw();
            return;
        }

        if (nota.isRest())
            return;

        let dur = parseInt(nota.getDuration());
        dur *= 2;

        nota.setDuration(String(dur));
        let instrument = compas.instrument;
        let clef = compas.clef;
        let nuevosSilencios = Array.from({ length: 2 }, () => new Nota(['b/4'], String(dur) + 'r', instrument,clef));
        compas.notas.splice(this.nota_selected + 1, 0, ...nuevosSilencios);

        compas.tuplets.push(new VexTuplet(compas.notas.slice(this.nota_selected, this.nota_selected + 3)));

        this.formated = false;
        this.Editdraw();
    }

    setCrescendo() {
        if (this.nota_selected === -1)
            return;

        if (this.prevNota_selected === -1) {
            this.cresc = true;
            this.prevPenta_selected = this.penta_selected;
            this.prevCompas_selected = this.compas_selected;
            this.prevNota_selected = this.nota_selected;
            this.Editdraw();
            return;
        }

        if (this.nota_selected === this.prevNota_selected) {
            this.deselectPrevNote();
            this.Editdraw();
            return;
        }

        let voice = this.voice_selected;
        if (this.penta_selected === this.prevPenta_selected) {
            let pentagrama = voice.pentagramas[this.penta_selected];
            pentagrama.addCrescendo(
                this.prevCompas_selected,
                this.prevNota_selected,
                this.compas_selected,
                this.nota_selected,
                this.crescendos);
            this.deselectPrevNote();
            this.Editdraw();
            return;
        }

        this.deselectPrevNote();
        this.Editdraw();

    }

    deselectPrevNote() {
        this.prevPenta_selected = -1;
        this.prevCompas_selected = -1;
        this.prevNota_selected = -1;
    }

    prevVoice() {
        if (this.voice_selected === null) {
            this.voice_selected = this.voices[0];
            return;
        }

        let nota = null;
        let index = this.voices.indexOf(this.voice_selected);
        if (index > 0) {
            nota = this.voice_selected.compases[this.compas_selected].notas[this.nota_selected];
            nota.setSelected(-1);
            this.voice_selected = this.voices[index - 1];
        }

        nota = this.voice_selected.compases[this.compas_selected].notas[this.nota_selected];
        this.key_selected = nota.getKeyOfIndex(0);
        nota.setSelected(this.key_selected);
    }

    nextVoice() {
        if (this.voice_selected === null) {
            this.voice_selected = this.voices[0];
            return;
        }

        let nota = null;

        let index = this.voices.indexOf(this.voice_selected);
        if (index < this.voices.length - 1) {
            nota = this.voice_selected.compases[this.compas_selected].notas[this.nota_selected];
            nota.setSelected(-1);
            this.voice_selected = this.voices[index + 1];
        }

        nota = this.voice_selected.compases[this.compas_selected].notas[this.nota_selected];
        this.key_selected = nota.getKeyOfIndex(0);
        nota.setSelected(this.key_selected);
    }
}
