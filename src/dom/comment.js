import { Node } from "./node";

export class Comment extends Node {

    constructor(text) {
        super(8, "#comment");
        this.nodeValue = text;
    }

    /* get the comments text content */
    get textContent() {
        return this.nodeValue;
    }

    /* set the comments text content */
    set textContent(value) {
        this.nodeValue = value;
    }
}