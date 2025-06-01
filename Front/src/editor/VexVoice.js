import { Voice } from "vexflow";
import Compas from "./Compas";
import Pentagrama from "./Pentagrama";
import VexConst from "./VexConst";
import Editor from "./Editor";
import instruments from "./Instruments";

export default class VexVoice {
    constructor(keySignature = 'C', instrument = {...instruments[19]}, name = 'name', tempo = 120, numerator = 4, denominator = 4, compasCount = 1, bordeR) {
        this.clef = instrument.defaultClef;
        this.keySignature = keySignature;
        this.tempo = tempo;
        this.timeNum = numerator;
        this.timeDen = denominator;

        this.instrument = instrument;
        this.name = name;
        this.compases = [];

        this.initCompas(compasCount);

        this.visibility = true;
        this.mute = false;
        this.bordeR = bordeR;

        this.pentagramas = [];

    }

    initCompas(count) {
        for (let i = 0; i < count; i++) {
            this.addCompas();
        }
    }

    addCompas() {
        let c = new Compas(this.timeNum, this.timeDen,this.instrument);
        c.setKeySignature(this.keySignature);

        this.compases.push(c);
        if (this.compases.length === 1) {
            let compas = this.compases[0];
            compas
                .addClef(this.clef)
                .setTimeSignatureVisibility(true);
        }
        return c;
    }

    setVisibility(visibility) {
        this.visibility = visibility;
        return this;
    }

    setTempoVisibility(visibility) {
        this.compases[0].setTempoVisibility(visibility);
        return this;
    }

    removeCompas() {
        this.compases.pop();
    }

    initCompasSize() {
        for (let i = 0; i < this.compases.length; i++) {
            this.compases[i].updateSize();
        }
    }

    format() {
        let startX = VexConst.startX;
        let startY = VexConst.startY;

        let clef = this.clef;
        this.compases[0].setPos(startX, startY);
        
        let over_y = this.compases[0].getOverY();
        let final_y = this.compases[0].getFinalY();
        this.compases[0].setKeySignatureVisibility(true);

        let compases_c = 1;

        let pentagrama = new Pentagrama();
        pentagrama.addCompas(this.compases[0]);

        this.pentagramas = [];
        this.pentagramas.push(pentagrama);

        for (let i = 1; i < this.compases.length; i++) {
            this.compases[i].setClef('');
            let compas_anterior = this.compases[i - 1];

            this.compases[i].setKeySignatureVisibility(false);

            //agrega un compas si no se sale del borde
            let espacio_vacio = this.bordeR - compas_anterior.getFinalX() - 1;
            if (espacio_vacio > this.compases[i].getW()) {
                if (over_y < this.compases[i].getOverY())
                    over_y = this.compases[i].getOverY();

                this.compases[i].setX(compas_anterior.getFinalX());
                this.compases[i].setY(compas_anterior.getY());
                compases_c++;

                pentagrama.addCompas(this.compases[i]);
                continue;
            }


            //queda fuera del pentagrama
            //asigna el espacio sobrante a los compases, reorganiza X y Y
            for (let j = i - compases_c; j < i; j++) {
                this.compases[j].addW(espacio_vacio / compases_c);
                if (j != i - compases_c)
                    this.compases[j].setX(this.compases[j - 1].getFinalX());
                this.compases[j].addY(over_y);

                if (final_y < this.compases[j].getFinalY())
                    final_y = this.compases[j].getFinalY();
            }

            this.compases[i].setClef(clef);
            this.compases[i].setX(startX);
            this.compases[i].setY(final_y);
            this.compases[i].setKeySignatureVisibility(true);

            pentagrama = new Pentagrama();
            this.pentagramas.push(pentagrama);
            pentagrama.addCompas(this.compases[i]);

            compases_c = 1;
            over_y = this.compases[i].getOverY();
            final_y = this.compases[i].getFinalY();

        }

        //estira los compases sumando espacio restante
        let espacio_vacio = this.bordeR - this.compases[this.compases.length - 1].getFinalX() - 1;
        for (let j = this.compases.length - compases_c; j < this.compases.length; j++) {
            this.compases[j].addW(espacio_vacio / compases_c);
            if (j != this.compases.length - compases_c)
                this.compases[j].setX(this.compases[j - 1].getFinalX());
            this.compases[j].addY(over_y);
            if (final_y < this.compases[j].getFinalY())
                final_y = this.compases[j].getFinalY();
        }
    }

    draw(context) {
        let final_comp = false;
        for (let i = 0; i < this.compases.length; i++) {
            final_comp = i === this.compases.length - 1;
            this.compases[i].draw(context, final_comp);
        }

        /* Hitbox de pentagramas
        context.setFillStyle('rgba(0,0,0,0.5)');
        for(let i=0;i<this.pentagramas.length;i++){
            let clef = this.pentagramas[i].getRec();
            console.log("x "+String(clef.x));
            console.log("y " +String(clef.y));
            console.log("w " +String(clef.w));
            console.log("h" +String(clef.h));
            context.fillRect(clef.x, clef.y, clef.w, clef.h);
        }*/
    }

    toggleVisibility(){
        this.visibility = !this.visibility;
        let editor = Editor.getInstance();
        editor.Editdraw();
    }

    toggleMute(){
        this.mute = !this.mute;
        let editor = Editor.getInstance();
        editor.Editdraw();
    }

    getTempo(){
        return this.tempo;
    }

    rename(name){
        console.log(name);
        this.name = name;
        return this;
    }

    setClef(clef){
        this.clef = clef;
        return;
    }

    getTimeNum(){
        return this.timeNum;
    }

    getTimeDen(){
        return this.timeDen;
    }
}