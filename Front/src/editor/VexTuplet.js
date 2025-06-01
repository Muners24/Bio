import { Tuplet } from "vexflow";

export default class VexTuplet {
    constructor(notas = []) {
        this.notas = notas;
        this.setFlagInTuplet();
    }

    setFlagInTuplet() {
        for (let i = 0; i < this.notas.length; i++) {
            this.notas[i].inTuplet = true;
        }
    }

    hasNote(nota) {
        return this.notas.indexOf(nota) !== -1;
    }

    draw(context) {
        let staveNotes = [];
        for(let i=0;i<this.notas.length;i++){
            staveNotes.push(this.notas[i].getVexNote());
        }

        let tuplet = new Tuplet(staveNotes);
        tuplet.setRatioed(true);
        tuplet.setBracketed(true);
        tuplet.setContext(context);
        tuplet.draw();
    }

    getFirstNoteIndex(){
        return this.notas[0];
    }
}