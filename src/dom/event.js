export class Event {

    constructor(type, opts) {
        this.type = type;
        this.bubbles = (opts && opts.bubbles);
        this.cancelable = (opts && opts.cancelable);
        this.detail = (opts && opts.detail);

        this._stop = false;
        this._end = false;

        Object.assign(this, opts);
    }

    /* stop event propagation */
    stopPropagation() {
        this._stop = true;
    }

    /* stop the immediate event propagation */
    stopImmediatePropagation() {
        this._end = this._stop = true;
    }

    /* prevent the default event behavior */
    preventDefault() {
        this.defaultPrevented = true;
    }
}