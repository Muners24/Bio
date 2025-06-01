import VexRec from "./VexRec";
import VexConst from "./VexConst";

export default class Pentagrama {
    constructor() {
        this.compases = [];
    }

    addCompas(compas) {
        this.compases.push(compas);
    }

    addCrescendo(prvCompasIndex, prvNotaIndex, compasIndex, notaIndex, crescendos) {
        let dir;
        if (prvCompasIndex <= compasIndex)
            dir = '+';

        if (prvCompasIndex > compasIndex)
            dir = '-';

        if (prvCompasIndex === compasIndex) {
            if (prvNotaIndex < notaIndex)
                dir = '+';
            else
                dir = '-';
        }

        let newKey = String(prvCompasIndex) + '/' + String(prvNotaIndex) + dir;
        let first = this.compases[prvCompasIndex].notas[prvNotaIndex];
        let last = this.compases[compasIndex].notas[notaIndex];
        let crescendo = { first: first, last: last };
        crescendos.set(newKey, crescendo);
    }

    draw(context, is_final = false) {

        let final_comp = false;
        for (let i = 0; i < this.compases.length; i++) {
            if (is_final)
                final_comp = i == this.compases.length - 1;

            this.compases[i].draw(context, final_comp);
            this.compases[i].getRec();
        }
    }

    getStartY() {
        let min = this.compases[0].getMinY();
        for (let i = 1; i < this.compases.length; i++) {
            let y = this.compases[i].getMinY();
            if (y < min) {
                min = y;
            }
        }

        return min;
    }

    getFinalY() {
        let max = 0;
        for (let i = 0; i < this.compases.length; i++) {
            let y = this.compases[i].getFinalY();
            if (y > max) {
                max = y;
            }
        }

        return max;
    }

    setY(y) {
        for (let i = 0; i < this.compases.length; i++) {
            this.compases[i].setY(y);
        }
    }

    getRec() {
        let w = 0;
        for (let i = 0; i < this.compases.length; i++) {
            w += this.compases[i].getW();
        }

        return new VexRec(
            VexConst.startX,
            this.getStartY(),
            w,
            this.getFinalY() - this.getStartY(),
        );
    }
}