import { Document } from "./dom/document";
import { Node } from "./dom/node";
import { Text } from "./dom/text";
import { Element } from "./dom/element";
import { Event } from "./dom/event";
import { ClassList } from "./dom/class-list";
import { Comment } from "./dom/comment";
import { CSSStyleSheet } from "./dom/css-style-sheet";
import { CustomElementRegistry } from "./dom/custom-element-registry";
import { DocumentFragment } from "./dom/document-fragment";
import { Location } from "./dom/location";
import { History } from "./dom/history";

/* render a node to a string */
export function renderToString(node, callback) {
    /* delete the exalt component mount and unmount functions */
    if(typeof node.mount == "function") node.mount = () => {};
    if(typeof node.unmount == "function") node.unmount = () => {}; 

    node.connectedCallback && node.connectedCallback();
    const str = serialize(node, callback);
    node.disconnectedCallback && node.disconnectedCallback();
    return str;
}

/* load a bundle using the esm package to support esm modules */
export function loadBundle(path) {
    initializeEnv();
    require = require("esm")(module);
    return require(path);
}

/* initialize the DOM environment by patching the globals with DOM apis */
function initializeEnv() {
    global.window = global;

    window.location = new Location();
    window.history = new History();

    window._handlers = {};
    window.addEventListener = Element.prototype.addEventListener.bind(window);
    window.removeEventListener = Element.prototype.addEventListener.bind(window);
    window.dispatchEvent = Element.prototype.dispatchEvent.bind(window);
    window.requestAnimationFrame = (fn) => setTimeout(fn);
    window.cancelAnimationFrame = (id) => clearTimeout(id);
    window.scrollTo = () => {};
    window.customElements = new CustomElementRegistry();

    window = Object.assign(window, {
        document: new Document(),
        Document,
        Node,
        Text,
        Element,
        SVGElement: Element,
        HTMLElement: Element,
        Event,
        CustomEvent: Event,
        ClassList,
        Comment,
        CSSStyleSheet,
        CustomElementRegistry,
        DocumentFragment
    });

    for (let i in global.window) {
        global[i] = global.window[i];
    }

    document.readyState = "interactive";
    document.dispatchEvent(new Event("DOMContentLoaded"));
    document.readyState = "complete";
    window.dispatchEvent(new Event("load"));
}

/* serialize a node into a string */
function serialize(node, callback) {
    let str = "";

    if (callback) callback(node);

    /* serialize attributes into a string */
    const serializeAttributes = ({ attributes = [] }) => {
        return attributes.map((attribute) => {
            return ` ${attribute.localName}="${attribute.value}"`;
        }).join("");
    };

    /* seriallize a node's children into a string */
    const serializeChildren = ({ childNodes }) => {
        return childNodes.map((node) => serialize(node, callback)).join("");
    };

    /* serialize a node's props into a string that can be parsed later */
    const serializeProps = (node) => {
        return `<script id="props" type="application/json">${JSON.stringify(node.props)}</script>`;
    };

    /* if a node is a text node, return its text content */
    if (node.nodeName == "#text") {
        return node.textContent;
    }

    /* start serializing the node's opening tag */
    str += `<${node.localName}${serializeAttributes(node)}>`;

    /* if the node has a shadow root, serialize it as a declarative shadow root */
    if (node.shadowRoot) {
        str += `<template shadowroot="${node.shadowRoot.mode}">${serializeChildren(node.shadowRoot)}</template>`;
    }

    /* if the node has any childNodes, serialize them */
    if (node.childNodes) {
        str += serializeChildren(node);
    }

    /* if the node has props, serialize the props into the markup */
    const hasSerializableProps = (node.props && Object.keys(node.props).filter((name) => !name.startsWith("on")).length > 0);
    if(hasSerializableProps) {
        str += serializeProps(node);
    }

    /* serialize the closing node tag */
    str += `</${node.localName}>`;

    return str;
}