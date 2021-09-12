export class ClassList {

    constructor(element) {
        this._element = element;
    }

    /* add a class to the classList */
    add(name) {
        const classList = set(this).add(name);
        this._element.className = Array.from(classList).join(" ");
        return this;
    }

    /* returns true if the classList contains the class */
    contains(name) {
        return set(this).has(name);
    }

    /* remove a class from the classList */
    remove(name) {
        const classList = set(this);
        classList.delete(name);

        this._element.className = Array.from(classList).join(" ");
        return this;
    }
}

/* turn the array of classes into a Set */
function set(list) {
    const classList = (list._element.className && list._element.className.split(" ")) ?? [];
    return new Set(classList);
}