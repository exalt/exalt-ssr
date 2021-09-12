export class CSSStyleSheet {

    constructor(ownerNode) {
        this.ownerNode = ownerNode;
        this.cssRules = [];
    }

    /* insert a css rule into the stylesheet */
    insertRule(rule, index = 0) {
        this.cssRules.splice(index, 0, rule);
        return index;
    }

    /* delete a css rule from the stylesheet */
    deleteRule(index) {
        this.cssRules.splice(index, 1);
    }
}