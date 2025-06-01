
export default class Notacion {
    static altura_notas = null;
    static keySignatures = null;
    static clefs = [];
    static keys = [];

    constructor() { }

    static initMap() {
        this.altura_notas = new Map();
        let notas = ['b/', 'a/', 'g/', 'f/', 'e/', 'd/', 'c/'];

        //cambiando para ajustar mouse a hitbox de notas
        let k = -45;
        for (let i = 7; i >= 0; i--) {
            for (let j = 0; j < notas.length; j++) {
                this.altura_notas.set((notas[j] + i.toString()), k);
                this.keys.push(notas[j] + i.toString());
                k += 5;
            }
        }

        this.keySignatures = new Map();
        let w = 13;
        this.keySignatures.set('C#', 7 * w - 4);   // DO# (7 sostenidos)
        this.keySignatures.set('F#', 6 * w - 2);   // SOL# (6 sostenidos)
        this.keySignatures.set('B', 5 * w - 2);   // RE# (5 sostenidos)
        this.keySignatures.set('E', 4 * w);   // LA# (4 sostenidos)
        this.keySignatures.set('A', 3 * w + 3);   // MI# (3 sostenidos)
        this.keySignatures.set('D', 2 * w + 5);    // SI (2 sostenidos)
        this.keySignatures.set('G', 1 * w + 7);    // SI (2 sostenidos)
        this.keySignatures.set('C', 1 * w + 7);    // DO (sin alteraciones)
        this.keySignatures.set('F', 1 * w + 7);    // FA (1 bemol)
        this.keySignatures.set('Bb', 2 * w + 5);   // SI♭ (1 bemol)
        this.keySignatures.set('Eb', 3 * w + 2);   // MI♭ (2 bemoles)
        this.keySignatures.set('Ab', 4 * w - 2);   // LA♭ (3 bemoles)
        this.keySignatures.set('Db', 5 * w - 4);   // RE♭ (4 bemoles)
        this.keySignatures.set('Gb', 6 * w-7);   // SOL♭ (5 bemoles)
        this.keySignatures.set('Cb', 7 * w-9);   // DO♭ (7 bemoles)


        this.clefs.push('treble');
        this.clefs.push('bass');
        this.clefs.push('percussion');
        this.clefs.push('tenor');
        this.clefs.push('alto');
    }

    static getNoteY(key = 'b/4') {
        if (this.altura_notas === null)
            this.initMap();

        if (this.altura_notas.has(key))
            return this.altura_notas.get(key);

        return null;
    }

    static getNextNote(key) {
        if (this.altura_notas === null)
            this.initMap();

        let i = this.keys.indexOf(key)
        if (i !== -1) {
            i--

            if(i < 0)
                return null;

            return this.keys[i];
        }
        return this.keys[0];
    }

    static getPreviusNote(key) {
        if (this.altura_notas === null)
            this.initMap();

        let i = this.keys.indexOf(key);

        if (i !== -1) {
            i++;

            if(i >= this.keys.length)
                return null;

            return this.keys[i];
        }
        return this.keys[this.keys.length-1];
    }

    static getKeySignatureW(key = 'C') {
        if (this.altura_notas === null)
            this.initMap();

        if (this.keySignatures.has(key))
            return this.keySignatures.get(key);

        return 0;
    }


    static getPreviousKeySignature(key) {
        if (this.altura_notas === null)
            this.initMap();

        const k = Array.from(this.keySignatures.keys());
        let i = k.indexOf(key);

        if (i !== -1) {
            if (i < k.length - 1) {
                i++;
            }
            return k[i];
        }
        return 'C';
    }

    static getNextKeySignature(key) {

        if (this.altura_notas === null)
            this.initMap();
        const k = Array.from(this.keySignatures.keys());
        let i = k.indexOf(key);

        if (i !== -1) {
            if (i > 0) {
                i--;
            }
            return k[i];
        }
        return 'C';
    }

    static getNextClef(clef) {
        if (this.altura_notas === null)
            this.initMap();

        let i = this.clefs.indexOf(clef)

        if (i !== -1) {
            if (i > 0)
                i--;

            return this.clefs[i];
        }
        return 'treble';
    }

    static getPreviusClef(clef) {
        if (this.altura_notas === null)
            this.initMap();

        let i = this.clefs.indexOf(clef)

        if (i !== -1) {
            if (i < this.clefs.length - 1)
                i++;
            return this.clefs[i];
        }
        return 'treble';
    }

    static getNoteOnY(iy, y){
        if (this.altura_notas === null)
            this.initMap(); 
        
        let key = '';

        for(let i = 0;i<this.keys.length;i++){
            let altura = this.altura_notas.get(this.keys[i]);
            altura += iy;
            if(altura >= y-2 &&  altura <= y+2)
                key = this.keys[i];
        }

        return key
    }
}


//ornament
//this.nota.addModifier(0,new Ornament('turn'));
//this.nota.addModifier(0,new Ornament('turn_inverted'));
//this.nota.addModifier(0,new Ornament('tr'));
//this.nota.addModifier(0,new Ornament('mordent'));
//this.nota.addModifier(0,new Ornament('mordent_inverted'));
        
//tremolo
//this.nota.addModifier(0,new Tremolo(3));
        