import { Node } from "./node";

export class Text extends Node {

    constructor(text) {
        super(3, "#text");
        this.nodeValue = text;
    }

    /* set the text nodes textContent */
    set textContent(value) {
        this.nodeValue = value;
    }

    /* get the text nodes textContent */
    get textContent() {
        return this.nodeValue;
    }
}