import VexFlow, {
  Stave, StaveNote, Formatter, Fraction, StaveHairpin,
  Voice, StaveConnector
} from 'vexflow'

import EditorListener from './EditorListener';
import VexVoice from './VexVoice';
import instruments from './Instruments';
import { durationMap, midiNameToVexNote } from './VexPlayer';
import VexPlayer from './VexPlayer';

export default class Editor extends EditorListener {
  static instance = null;
  static eventTarget = new EventTarget();

  constructor(canvas, id = '') {
    if (Editor.instance) {
      return Editor.instance;
    }

    super(canvas);
    this.id = id;
    this.player = new VexPlayer();
    this.isPlaying = false;
    this.voices = [];

    this.compases_c = 1;
    this.clef = '';
    this.keySignature = '';
    this.timeNum = 4;
    this.timeDen = 4;
    this.tempo;
    this.formated = false;

    this.config();
    this.Editdraw();
    this.initInput();

    this.setChord();

    this.isPaused = false;
    this.isCanceled = false;

    Editor.instance = this;
  }

  static getInstance(canvas = 'Editor') {
    if (!Editor.instance) {
      Editor.instance = new Editor(canvas);
    }
    return Editor.instance;
  }

  static destroy() {
    Editor.instance = null;
  }

  cleanUp() {
    this.player = null;
    this.voices = [];
    this.canvas = null
    this.render = null
    this.context = null
    this.rec = null
    this.voice_selected = null;
    this.temp_compas = null;
    this.temp_nota = null;
    this.crescendos.clear();
    this.crescendos = null;
  }

  addCompas() {
    this.noteDeselect();

    for (let i = 0; i < this.voices.length; i++) {
      let voice = this.voices[i];
      voice.addCompas();
    }

    this.formated = false;
    this.Editdraw();
    this.Editdraw();

    this.compases_c++;
  }

  removeCompas() {
    if (this.compases_c === 1)
      return;

    this.noteDeselect();

    for (let i = 0; i < this.voices.length; i++) {
      let voice = this.voices[i];
      voice.removeCompas();
    }

    this.formated = false;
    this.Editdraw();
    this.Editdraw();
  }

  config(clef = 'treble', keySignature = 'C', tempo = 120, numerator = 1, denominator = 4) {
    this.clef = clef;
    this.timeNum = numerator;
    this.timeDen = denominator;
    this.keySignature = keySignature;
    this.tempo = tempo;

    //1 = compasCount
    this.addVoice('Voz 1', { ...instruments[19] });

    this.formated = false;
    this.Editdraw();
  }

  setChord() {
    let compas = this.voices[0].compases[0];
    compas.notas = [];
    compas.addNota(['b/4'],'1r');
  }

  addVoice(name, instrument) {
    this.noteDeselect();
    this.voices.push(new VexVoice(
      this.keySignature,
      instrument,
      name,
      this.tempo,
      this.numerator,
      this.denominator,
      this.compases_c,
      this.bordeR
    ));

    this.formated = false;
    this.Editdraw();
  }

  Editdraw() {
    requestAnimationFrame(() => {
      this.drawCompases();
    });
  }

  format() {
    if (this.formated)
      return;

    this.adjustVociesX();

    let final_y;
    //voices
    for (let i = 0; i < this.voices.length; i++) {
      let voice = this.voices[i];
      if (voice.visibility) {
        voice.format();
      }
    }

    final_y = this.adjustVociesY();

    if (this.getH() !== final_y)
      this.render.resize(this.bordeR, final_y);

    this.formated = true;
  }

  drawCompases() {
    this.context.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    this.context.setFillStyle('rgba(0,0,0,1)');

    this.format();

    let tempo_drawed = false;
    for (let i = 0; i < this.voices.length; i++) {
      let voice = this.voices[i];
      if (voice.visibility) {
        voice.setTempoVisibility(false);

        if (!tempo_drawed) {
          voice.setTempoVisibility(true);
          tempo_drawed = true;
        }
        voice.draw(this.context);
      }
    }

    this.drawVoicesConnectors();

    //ok
    //this.drawCrescendos();

    if (this.temp_nota !== null)
      Formatter.FormatAndDraw(this.context, this.temp_compas, [this.temp_nota]);

    this.drawKeySelected();

    //this.drawPrevNoteSelected();
    //this.drawHitBox();


    /*
    let notas = [];
    for(let i = 0;i<this.compases.length;i++){
      for(let j=0;j<this.compases[i].staveNotes.length;j++){
        notas.push(this.compases[i].staveNotes[j]);
      }
    }
    const tie = new StaveTie({
      first_note: notas[0],
      last_note: notas[notas.length-5]
    });
    tie.setContext(this.context).draw();

    */
  }

  drawCrescendos() {
    const crescArray = Array.from(this.crescendos.keys());
    for (let i = 0; i < crescArray.length; i++) {
      let notas = this.crescendos.get(crescArray[i]);
      let first = notas.first.getVexNote();
      let last = notas.last.getVexNote();

      let cresc = new StaveHairpin({ first_note: first, last_note: last }, StaveHairpin.type.CRESC);
      cresc.setContext(this.context);
      cresc.draw();
    }
  }

  drawKeySelected() {
    if (this.key_selected === '')
      return;

    let compas = this.voice_selected.pentagramas[this.penta_selected].compases[this.compas_selected];
    if (compas.notas[this.nota_selected].isRest())
      return;

    let nota = compas.notas[this.nota_selected];
    nota.updateX();
    let temp_compas = new Stave(
      nota.getX() - 17,
      compas.getY(),
      nota.getW());

    let temp_nota = null;
    if (nota.getDuration() <= 4) {
      temp_nota = new StaveNote({ keys: [this.key_selected], duration: nota.getDuration() });
    }
    else {
      temp_nota = new StaveNote({ keys: [this.key_selected], duration: '4' });
    }

    if (nota.hasDot())
      temp_nota.addDotToAll();

    temp_nota.setStyle({
      fillStyle: 'rgba(0,100,200,1)', strokeStyle: 'rgba(0,0,0,0.0)'
    });

    temp_nota.setBeam();

    Formatter.FormatAndDraw(this.context, temp_compas, [temp_nota]);
  }

  drawPrevNoteSelected() {
    if (this.prevNota_selected === -1)
      return;

    let compas = this.pentagramas[this.prevPenta_selected].compases[this.prevCompas_selected];
    let nota = compas.notas[this.prevNota_selected];
    nota.updateX();
    let temp_compas = new Stave(
      nota.getX() - 17,
      compas.getY(),
      nota.getW());

    //keys copia, no referencia 
    let temp_nota = new StaveNote({ keys: nota.getKeys(), duration: nota.getDuration() });

    if (nota.hasDot())
      temp_nota.addDotToAll();

    temp_nota.setStyle({
      fillStyle: 'red', strokeStyle: 'rgba(0,0,0,0)'
    });

    temp_nota.setBeam();

    Formatter.FormatAndDraw(this.context, temp_compas, [temp_nota]);
  }

  drawHitBox() {
    //rectangulos para comprobar medidas

    this.context.setFillStyle('rgba(150,150,150,1)');
    for (let i = 0; i < this.voices.length; i++) {
      let voice = this.voices[i];
      for (let j = 0; j < voice.pentagramas.length; j++) {
        let pentagrama = voice.pentagramas[j];
        for (let k = 0; k < pentagrama.compases.length; k++) {
          let compas = pentagrama.compases[k];
          for (let z = 0; z < compas.notas.length; z++) {
            let nota = compas.notas[z];
            let recs = nota.getRecs();

            for (let m = 0; m < recs.length; m++) {
              this.context.fillRect(recs[m].x, recs[m].y, recs[m].w, recs[m].h);
            }
          }
        }
      }
    }

    /*
    for (let i = 0; i < this.compases.length; i++) {
      let compas = this.compases[i];
      let cmp = compas.getRec();

      //this.context.fillRect(cmp.getX(), cmp.getY(), cmp.getW(), cmp.getH());


      if (compas.getClef() != '') {
        let clef = compas.getClefRec();
        this.context.fillRect(clef.x, clef.y, clef.w, clef.h);
      }

      if (compas.getKeySignatureVisibility()) {
        let key = compas.getKeySignatureRec();
        this.context.fillRect(key.x, key.y, key.w, key.h);
      }

      if (compas.getTimeSignature() != '') {
        let time = compas.getTimeNumRec();
        this.context.fillRect(time.x, time.y, time.w, time.h);
        time = compas.getTimeDenRec();
        this.context.fillRect(time.x, time.y, time.w, time.h);
      }
    }
   */
  }

  setTempo(tempo) {
    this.voices[0].compases[0].setTempo(tempo);
    this.Editdraw();
  }

  getTempo() {
    return this.voices[0].getTempo();
  }


  getH() {
    return this.canvas.height;
  }

  reinit() {
    this.rec = this.canvas.getBoundingClientRect();
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

    this.pentagramas = [];
    this.crescendos = new Map();
  }

  getCompasNum() {
    return this.voices[0].compases[0].getTimeNum();
  }

  getCompasDen() {
    return this.voices[0].compases[0].getTimeDen();
  }

  cargarPartitura(notacion) {

    this.reinit()
    this.config();
    this.setTempo(notacion.tempo);
    this.setCompasNum(notacion.numerator);
    this.setCompasDen(notacion.denominator);

    let i = 0;
    let notas = notacion.notas;
    while (notas.length !== 0) {

      let cap = new Fraction(this.getCompasNum(), this.getCompasDen());
      this.compases[i].empty();

      while (cap.numerator !== 0 && cap.greaterThanEquals(new Fraction(1, parseInt(notas[0].dur)))) {
        cap.simplify();
        this.compases[i].addNota(notas[0].keys, notas[0].dur);
        cap.subtract(new Fraction(1, parseInt(notas[0].dur)));
        notas.splice(0, 1);
      }

      while (cap.numerator !== 0) {
        cap.simplify();
        this.compases[0].addNota(['b/4'], String(cap.denominator) + 'r')
        cap.subtract(new Fraction(1, cap.denominator));
      }

      if (notas.length !== 0) {
        this.addCompas();
        i++;
      }
    }

    this.formated = false;
    this.Editdraw();
  }

  getFullData() {
    let voices = [];

    for (let i = 0; i < this.voices.length; i++) {
      let voice = this.voices[i];
      let compases = [];

      for (let j = 0; j < voice.compases.length; j++) {
        let compas = voice.compases[j];
        let notas = [];

        for (let k = 0; k < compas.notas.length; k++) {
          let nota = compas.notas[k];

          notas.push({
            keys: nota.getKeys(),
            dur: nota.getDuration(),
            accidentals: nota.getAccidentals(),
            articulations: nota.getArticulations(),
            dotted: nota.hasDot(),
            dynamic: nota.getDynamic ? nota.getDynamic() : "",
            text: nota.nota.getText(),
          });
        }

        compases.push({ notas: notas });
      }

      voices.push({
        clef: voice.clef,
        keySignature: voice.keySignature,
        tempo: this.getTempo(),
        timeNum: voice.getTimeNum(),
        timeDen: voice.getTimeDen(),
        instrument: voice.instrument,
        name: voice.name,
        compases: compases
      });
    }

    return voices;
  }

  getPlayableData() {
    let parts = [];

    for (let i = 0; i < this.voices.length; i++) {
      let voice = this.voices[i];
      let notas = [];
      for (let j = 0; j < voice.compases.length; j++) {
        let compas = voice.compases[j];
        for (let k = 0; k < compas.notas.length; k++) {
          let nota = compas.notas[k];
          notas.push({
            keys: nota.getKeys(),
            dur: nota.getDuration()
          })
        }
      }

      parts.push({
        instrument: this.voices[i].instrument,
        tempo: this.getTempo(),
        numerator: voice.getTimeNum(),
        denominator: voice.getTimeDen(),
        notas: notas
      })
    }

    return parts;
  }

  play() {
    if (this.player.isPlaying || this.isPlaying)
      return;

    this.isPlaying = true;
    this.isCanceled = false;
    this.noteDeselect();
    this.signDeselect();
    let parts = this.getPlayableData();
    this.player.play(parts);

    for (let i = 0; i < this.voices.length; i++) {
      this.drawPlay(this.voices[i], false);
    }
  }

  stop() {
    this.player.stop();
    this.player.setIsPlaying(false);
    Editor.emit('playbackEnded');
    this.isPlaying = false;
    this.isPaused = false;
  }

  pause() {
    this.player.pause();
    this.isPaused = true;
  }

  resume() {
    this.player.resume();
    this.isPaused = false;
  }

  async reset() {
    this.stop();
    await this.sleep(300);
    Editor.emit('playbackStart');
    this.play();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async drawPlay(voice) {
    let notas = [];
    for (let compas of voice.compases) {
      for (let nota of compas.notas) {
        notas.push(nota);
      }
    }

    this.isPlaying = true;
    this.isPaused = false;

    for (let i = 0; i < notas.length; i++) {
      let nota = notas[i];
      let dur = durationMap[nota.getDuration().replace('r', '')];
      let noteDurationMs = this.calcularMs(parseInt(dur));

      nota.playing = true;
      this.Editdraw();

      let start = Date.now();
      let elapsed = 0;

      while (elapsed < noteDurationMs) {
        if (!this.isPlaying) {
          nota.playing = false;
          this.Editdraw();
          Editor.emit('playbackEnded');
          return;
        }

        if (this.isPaused) {
          this.Editdraw();

          while (this.isPaused) {
            await this.sleep(50);

          }

          this.Editdraw();

          start += Date.now() - (start + elapsed);
        }

        await this.sleep(10);
        elapsed = Date.now() - start;
      }

      nota.playing = false;
      this.Editdraw();
    }

    this.isPlaying = false;
    this.player.setIsPlaying(false);
    Editor.emit('playbackEnded');
    this.isCanceled = false;
  }

  calcularMs(duration) {
    return (60000 / this.getTempo()) / (duration / this.getCompasDen());
  }

  adjustVociesX() {
    //x
    for (let i = 0; i < this.voices.length; i++) {
      this.voices[i].initCompasSize();
    }

    if (this.voices.length < 2) {
      return;
    }

    let compas_c = this.voices[0].compases.length;
    for (let i = 0; i < compas_c; i++) {
      let max_width = 0;
      let width;

      for (let j = 0; j < this.voices.length; j++) {
        let voice = this.voices[j];
        if (voice.visibility) {
          width = voice.compases[i].getW();
          if (width > max_width) {
            max_width = width;
          }
        }
      }

      for (let j = 0; j < this.voices.length; j++) {
        let voice = this.voices[j];
        voice.compases[i].setW(max_width);
      }
    }
  }

  adjustVociesY() {
    if (this.voices.length === 0)
      return 0;

    if (this.voices.length < 2) {
      return this.voices[this.voices.length - 1].pentagramas[this.voices[0].pentagramas.length - 1].getFinalY();
    }

    //y
    let y = 10;
    let pentagrama_c = this.voices[0].pentagramas.length;

    for (let i = 0; i < pentagrama_c; i++) {
      for (let j = 0; j < this.voices.length; j++) {
        let voice = this.voices[j];
        if (voice.visibility) {
          voice.pentagramas[i].setY(y);
          y = voice.pentagramas[i].getFinalY();
        }
      }
    }

    return this.voices[this.voices.length - 1].pentagramas[this.voices[0].pentagramas.length - 1].getFinalY();
  }

  drawVoicesConnectors() {
    if (this.voices.length < 2) {
      return;
    }

    let first_voice_index = -1;
    let last_voice_index = -1;
    for (let i = 0; i < this.voices.length; i++) {
      if (this.voices[i].visibility) {
        if (first_voice_index === -1) {
          first_voice_index = i;
        }

        last_voice_index = i;
      }
    }

    if (first_voice_index === last_voice_index) {
      return;
    }

    let pentagrama_c = this.voices[0].pentagramas.length;
    for (let i = 0; i < pentagrama_c; i++) {
      let up = this.voices[first_voice_index].pentagramas[i].compases[0];
      let down = this.voices[last_voice_index].pentagramas[i].compases[0];
      let brace = new StaveConnector(up.getStave(), down.getStave());
      brace.setType(StaveConnector.type.BRACKET);
      brace.setContext(this.context).draw();
    }
  }

  deleteVoice(voice) {
    this.voices = this.voices.filter(v => v !== voice);
    this.Editdraw();
  }

  swapVoiceUp(voice) {
    let index = this.voices.indexOf(voice);
    if (index <= 0) {
      return;
    }

    this.noteDeselect();

    let temp_voice = this.voices[index];
    this.voices[index] = this.voices[index - 1];
    this.voices[index - 1] = temp_voice;

    this.formated = false;
    this.Editdraw();
  }

  swapVoiceDown(voice) {
    let index = this.voices.indexOf(voice);
    if (index >= this.voices.length - 1) {
      return;
    }

    this.noteDeselect();

    let temp_voice = this.voices[index];
    this.voices[index] = this.voices[index + 1];
    this.voices[index + 1] = temp_voice;

    this.formated = false;
    this.Editdraw();
  }

  loadChord(keys){
    let nota = this.voices[0].compases[0].notas[0];
    for(let key of keys){
      console.log(key);
      let vexKey = midiNameToVexNote(key);
      console.log(vexKey);
      nota.addKey(vexKey);
    }

    this.Editdraw();
  }

  static on(eventName, callback) {
    Editor.eventTarget.addEventListener(eventName, callback);
  }

  static off(eventName, callback) {
    Editor.eventTarget.removeEventListener(eventName, callback);
  }

  static emit(eventName, detail = {}) {
    Editor.eventTarget.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
}