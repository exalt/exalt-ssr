import { findWhere, splice, each } from "./utils";

/* node class that all DOM objects inherit from */
export class Node {

    constructor(nodeType, nodeName) {
        this.nodeType = nodeType;
        this._nodeName = nodeName;
        this.parentNode = null;
        this.childNodes = [];
        this._content = null;
    }

    /* get the node's name */
    get nodeName() {
        return this._nodeName || getTagName(this.constructor);
    }

    /* set the node's name */
    set nodeName(value) {
        this._nodeName = value;
    }

    /* get the node's next sibling */
    get nextSibling() {
        if (!this.parentNode) return null;
        return this.parentNode.childNodes[findWhere(this.parentNode.childNodes, this, true, true) + 1] || null;
    }

    /* get the node's previous sibling */
    get previousSibling() {
        if (!this.parentNode) return null;
        return this.parentNode.childNodes[findWhere(this.parentNode.childNodes, this, true, true) - 1] || null;
    }

    /* get the node's first child */
    get firstChild() {
        return this.childNodes[0] || null;
    }

    /* get the node's last child */
    get lastChild() {
        return this.childNodes[this.childNodes.length - 1] || null;
    }

    /* get the node's content */
    get content() {
        if (this._content) return this._content;

        this._content = document.createDocumentFragment();

        this.childNodes.forEach((node) => {
            node = node.cloneNode(true);
            node.parentNode = this._content;
            this._content.childNodes.push(node);
        });

        return this._content;
    }

    /* get the node's text content */
    get textContent() {
        return this.childNodes.map((child) => child.nodeValue).join("");
    }

    /* set the node's text content */
    set textContent(value) {
        while (this.firstChild) {
            this.removeChild(this.firstChild);
        }

        this.appendChild(document.createTextNode(value));
    }

    /* append a child node to this node */
    appendChild(child) {
        this.insertBefore(child);
        return child;
    }

    /* insert a node before another node */
    insertBefore(child, ref) {
        return each(child, (newNode) => {
            newNode.remove();
            newNode.parentNode = this;

            if (ref) splice(this.childNodes, ref, newNode, true);
            else this.childNodes.push(newNode);

            connectNode(newNode);
        });
    }

    /* replace a node with another node */
    replaceChild(child, ref) {
        if (ref.parentNode == this) {
            this.insertBefore(child, ref);
            ref.remove();
            return ref;
        }
    }

    /* remove a child node */
    removeChild(child) {
        return each(child, (refNode) => {
            disconnectNode(refNode, this);
            splice(this.childNodes, refNode, false, true);
        });
    }

    /* remove this node */
    remove() {
        if (!this.parentNode) return;
        this.parentNode.removeChild(this);
    }

    /* clone the node */
    cloneNode(deep) {
        let clone;

        switch (this.nodeType) {
            /* comment node */
            case 8:
                clone = document.createComment(this.textContent);
                break;

            /* document fragment */
            case 11:
                clone = document.createDocumentFragment();
                break;

            /* element node */
            case 1:
                clone = document.createElement(this.nodeName);
                clone.attributes = this.attributes.slice();
                break;

            /* text node */
            case 3:
                clone = document.createTextNode(this.textContent);
                break;
        }

        /* if its not a deep clone, we are done */
        if (!deep) return clone;

        /* clone the nodes children recursively */
        for (let childNode of this.childNodes) {
            clone.childNodes.push(childNode.cloneNode(true));
        }

        return clone;
    }

    /* check if this node contains a node */
    contains(node) {
        if (node == this) return true;

        for (let childNode of this.childNodes) {
            if (childNode.contains(node)) return true;
        }

        return false;
    }

    /* returns true if this node has child nodes */
    hasChildNodes() {
        return (this.childNodes.length > 0);
    }

    /* checks if this node is equal to a node */
    isEqualNode(node) {
        return (node == this);
    }

}

/* isConnected symbol to track if a node is connected to the DOM */
const isConnected = Symbol("isConnected");

/* connect a node to the DOM */
function connectNode(node) {
    if (node[isConnected]) return;
    node.connectedCallback && node.connectedCallback();
    node[isConnected] = true;
}

/* disconnect a node from the DOM */
function disconnectNode(node) {
    if (!node[isConnected]) return;
    node.disconnectedCallback && node.disconnectedCallback();
    node[isConnected] = false;
}

/* get the nodes custom element tag name */
function getTagName(node) {
    const keys = Object.keys(window.customElements.registry);

    for (let tagName of keys) {
        if (window.customElements.get(tagName) == node) {
            return tagName;
        }
    }
}