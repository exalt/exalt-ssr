import { Node } from "./node";
import { ClassList } from "./class-list";
import { CSSStyleSheet } from "./css-style-sheet";
import { findWhere, splice, createAttributeFilter, find } from "./utils";
import { parseFragment } from "parse5";

export class Element extends Node {

    constructor(nodeType, nodeName) {
        super(nodeType || 1, nodeName);

        this.attributes = [];
        this._handlers = {};
        this.style = {};

        this.classList = new ClassList(this);
        this.localName = (this.nodeName ?? "").toLowerCase();
        this.shadowRoot = null;

        this._onload = null;
        this._loaded = false;
        this._src = null;
        this._sheet = null;
        this._hasShadowRoot = false;
    }

    /* get the amount of child nodes */
    get childElementCount() {
        return this.childNodes.length;
    }

    /* get the elements className list */
    get className() {
        return this.getAttribute("class");
    }

    /* set the elements className list */
    set className(value) {
        this.setAttribute("class", value);
    }

    /* get the elements style attribute */
    get cssText() {
        return this.getAttribute("style");
    }

    /* set the elements style attribute */
    set cssText(value) {
        this.setAttribute("style", value);
    }

    /* get the elements children */
    get children() {
        return this.childNodes.filter((node) => node.nodeType == 1);
    }

    /* get the innerHTML of the element */
    get innerHTML() {
        return this.childNodes.map((child) => {
            return (child.nodeType == 8) ? `<!--${child.textContent}-->` : (child.outerHTML || child.textContent);
        }).join("");
    }

    /* set the innerHTML of the element */
    set innerHTML(value) {
        if (this.nodeName == "SCRIPT") {
            this.textContent = value;
            return;
        }

        while (this.hasChildNodes()) {
            this.removeChild(this.firstChild);
        }

        if (value) {
            const fragment = parseFragment(value);
            const node = createNodeFromFragment(fragment);
            this.appendChild(node);
        }
    }

    /* get the outerHTML of the element */
    get outerHTML() {
        if (this.localName == "#comment") {
            return `<!--${this.innerHTML}-->`;
        }

        const attributes = this.attributes.reduce((previous, { name, value }) => {
            return previous + ` ${name}="${value}"`;
        }, "");

        return `<${this.localName}${attributes}>${this.innerHTML}</${this.localName}>`;
    }

    /* get the textContent of the element */
    get textContent() {
        return this.childNodes.map((child) => child.textContent).join("");
    }

    /* set the textContent of the element */
    set textContent(value) {
        while (this.hasChildNodes()) {
            this.removeChild(this.firstChild);
        }

        this.appendChild(document.createTextNode(value));
    }

    /* get the elements next sibling of type Element */
    get nextElementSibling() {
        let sibling = this;

        while ((sibling = sibling.nextSibling)) {
            if (sibling.nodeType == 1) return sibling;
        }

        return null;
    }

    /* get the elements previous sibling of type element */
    get previousElementSibling() {
        let sibling = this;

        while ((sibling = sibling.previousSibling)) {
            if (sibling.nodeType == 1) return sibling;
        }

        return null;
    }

    /* get the elements onload event */
    get onload() {
        return this._onload;
    }

    /* set the elements onload event */
    set onload(value) {
        this._onload = value;

        if (!this._loaded && this._onload && this._src) {
            this._loaded = true;
            this._onload();
        }
    }

    /* get the elements CSSStyleSheet object */
    get sheet() {
        if (this.nodeName != "STYLE") return null;
        return this._sheet ?? (this.sheet = new CSSStyleSheet(this));
    }

    /* get the src of the element */
    get src() {
        return this._src;
    }

    /* set the src of the element */
    set src(value) {
        this.setAttribute("src", value);

        this._loaded = false;
        this._src = value;

        if (!this._loaded && this.onload) {
            this._loaded = true;
            this._onload();
        }
    }

    /* get the tagName of the element */
    get tagName() {
        return this.nodeName;
    }

    /* set an attribute on the element */
    setAttribute(name, value) {
        this.setAttributeNS(null, name, value);
    }

    /* get an attribute on the element using the attribute name */
    getAttribute(name) {
        return this.getAttributeNS(null, name);
    }

    /* check if an element has an attribute */
    hasAttribute(name) {
        return this.hasAttributeNS(null, name);
    }

    /* returns true if the element has attributes */
    hasAttributes() {
        return (this.attributes.length > 0);
    }

    /* remove an attribute from the element */
    removeAttribute(name) {
        this.removeAttributeNS(null, name);
    }

    /* set an attribute with a namespace on the element */
    setAttributeNS(namespace, name, value) {
        const observedAttributes = this.constructor.observedAttributes || [];
        const oldValue = this.getAttribute(name);

        let attribute = findWhere(this.attributes, createAttributeFilter(namespace, name), false, false);

        if (!attribute) this.attributes.push(attribute = { namespace, localName: name });

        attribute.value = String(value);

        if (this.attributeChangedCallback && observedAttributes.includes(name)) {
            this.attributeChangedCallback(name, oldValue, value);
        }
    }

    /* get an attribute with a namespace */
    getAttributeNS(namespace, name) {
        const attribute = findWhere(this.attributes, createAttributeFilter(namespace, name), false, false);
        return (attribute == null) ? null : attribute.value;
    }

    /* check if the element has a namespaced attribute */
    hasAttributeNS(namespace, name) {
        return (this.getAttributeNS(namespace, name) != null);
    }

    /* remove a namespaced attribute from the element */
    removeAttributeNS(namespace, name) {
        const oldValue = this.getAttribute(name);

        splice(this.attributes, createAttributeFilter(namespace, name), false, false);
        if (this.attributeChangedCallback) this.attributeChangedCallback(name, oldValue, null);
    }

    /* add an event listener to the element */
    addEventListener(type, handler) {
        const lowerType = type.toLowerCase();
        (this._handlers[lowerType] || (this._handlers[lowerType] = [])).push(handler);
    }

    /* remove an event listener on the element */
    removeEventListener(type, handler) {
        splice(this._handlers[type.toLowerCase()], handler, false, true);
    }

    /* dispatch an event on the element */
    dispatchEvent(event) {
        let target = event.target = this;
        let cancelable = event.cancelable;
        let handler;

        const shouldRun = (
            event.bubbles &&
            !(cancelable && event._stop) &&
            (target = target.parentNode)
        );

        while (shouldRun) {
            event.currentTarget = target;
            handler = target._handlers[event.type.toLowerCase()];

            if (handler) {
                for (let i = handler.length; i--;) {
                    if ((handler.call(target, event) == false || event._end) && cancelable) {
                        event.defaultPrevented = true;
                    }
                }
            }
        }

        return (handler != null);
    }

    /* get all the assigned nodes of a slot element */
    assignedNodes() {
        if (this.nodeName != "SLOT") {
            throw new Error("assignedNodes called on non-slot element!");
        }

        const name = this.getAttribute("name") || this.name;
        let node = this;
        let host;

        while ((node = node.parentNode)) {
            if (node.host) {
                host = node.host;
                break;
            }
        }

        if (host) {
            return host.childNodes.filter((node) => {
                return name ? node.getAttribute && node.getAttribute("slot") == name : !node.getAttribute || !node.getAttribute("slot");
            });
        }

        return [];
    }

    /* attach a shadow root to the element */
    attachShadow({ mode }) {
        const host = this;
        const shadowRoot = document.createElement("template");

        if (this._hasShadowRoot) {
            throw new Error(`Failed to execute "attachShadow" on "Element": Shadow root cannot be created on a host which already hosts a shadow tree.`);
        }

        this._hasShadowRoot = true;

        shadowRoot.host = host;
        shadowRoot.mode = mode;

        if (mode == "open") {
            this.shadowRoot = shadowRoot;
        }

        return shadowRoot;
    }

    /* find a single element in the dom using a selector */
    querySelector(selector, options = { one: true }) {
        /* find an id */
        if(selector[0] == "#") {
            return find(this, (node) => node.getAttribute("id") == selector.slice(1), options);
        }

        /* find a class */
        else if (selector[0] == ".") {
            return find(this, (node) => node.getAttribute("class").includes(selector.slice(1)), options);
        }

        /* find an attribute */
        else if(selector.startsWith("[") && selector.endsWith("]") && !selector.includes("=")) {
            return find(this, (node) => node.hasAttribute(selector.slice(1, -1)), options);
        }

        /* try to find it as an element name */
        else {
            return find(this, (node) => node.nodeName.toLowerCase() == selector, options);
        }
    }

    /* find all elements in the dom that match the selector */
    querySelectorAll(selector) {
        return this.querySelector(selector, { one: false });
    }

    /* get an element from the dom that has the specified id */
    getElementById(id) {
        return find(this, (node) => node.getAttribute("id") == id, { one: true });
    }

    /* get the elements in the dom that have the specified className */
    getElementsByClassName(className) {
        return find(this, (node) => node.getAttribute("class").includes(className));
    }
    
    /* get the elements that have the specified tagName */
    getElementsByTagName(tagName) {
        return find(this, (node) => node.nodeName.toLowerCase() == tagName);
    }

    scrollIntoView() {
        /* empty function to prevent errors (we cant scroll on server side anyway) */
    }
}

/* create a node from a parsed fragment */
function createNodeFromFragment(fragment) {
    let node;

    const { attrs, childNodes, data, nodeName, value } = fragment;

    switch (nodeName) {
        case "#comment":
            node = document.createComment(data);
            break;

        case "#document-fragment":
            node = document.createDocumentFragment();
            break;

        case "#text":
            node = document.createTextNode(value);
            break;

        default:
            node = document.createElement(nodeName);

            if (attrs) {
                attrs.forEach(({ name, value }) => {
                    node.setAttribute(name, value);
                });
            }
            break;
    }

    if (childNodes) {
        childNodes.forEach((child) => {
            node.appendChild(createNodeFromFragment(child));
        });
    }

    return node;
}