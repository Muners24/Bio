
export default class VexRec {
    constructor(x = 0, y = 0, w = 0, h = 0) {
        this.x = x;
        this.y = y;
        this.h = h;
        this.w = w;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getW() {
        return this.w;
    }

    getH() {
        return this.h;
    }

    setX(x) {
        this.x = x;
    }

    setY(y) {
        this.y = y;
    }

    setW(w) {
        this.w =w;
    }

    setH(h) {
        this.h = h;
    }

    setPos(x,y){
        this.x = x;
        this.y = y;
    }

    getFinalY(){
        return this.y+this.h;
    }

    getFinalX(){
        return this.x+this.w;
    }

    getRec(){
        return this;
    }

    addW(w){
        this.w += w;
    }

    addY(y){
        this.y += y;
    }

    collisionPoint(x, y){
        return (x >= this.x && x <= this.getFinalX() && y >= this.y && y <= this.getFinalY());
    }

}