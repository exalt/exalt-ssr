import { Event } from "./event";

export class History {

    constructor() {
        this._history = [];
        this.index = 0;
        this.state = null;
        this.pushState(null, null, "/");
    }

    /* get the history stack length */
    get length() {
        return this._history.length;
    }

    /* get the current history state */
    get state() {
        return this._current().state;
    }

    /* get the current history data */
    _current() {
        return this._history[this.index];
    }

    /* update the location pathname */
    _update() {
        window.location.pathname = this._current().url;
    }

    /* dispatch a popstate event */
    _dispatch() {
        dispatchEvent(new Event("popstate"), { state: this.state });
    }

    /* go back to the previous object in the history stack */
    back() {
        if (this.index <= 0) return;

        this.index--;
        this._update();
        this._dispatch();
    }

    /* go to the next object in the history stack */
    forward() {
        if(this.index >= this.length - 1) return;
            
        this.index++;
        this._update();
        this._dispatch();
    }

    /* go to a specific object in the stack */
    go(rel) {
        const abs = Math.abs(rel);

        if(rel > 0) {
            for(let i = 0; i < abs; i++) {
                this.forward();
            }
        }

        else if (rel < 0) {
            for(let i = 0; i < abs; i++) {
                this.back();
            }
        }
    }

    /* push an object onto the stack */
    pushState(state, title, url) {
        this._history.push({ state, title, url });
        this._update();
    }

    /* replace the current object on the stack */
    replaceState(state, title, url) {
        this._history.pop();
        this._history.push({ state, title, url });
        this._update();
    }
}