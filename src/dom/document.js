import { Element } from "./element";
import { Comment } from "./comment";
import { DocumentFragment } from "./document-fragment";
import { Text } from "./text";

export class Document extends Element {

    constructor() {
        super(9, "#document");

        this.documentElement = this.createElement("html");
        this.head = this.createElement("head");
        this.body = this.createElement("body");

        this.appendChild(this.documentElement);
        this.documentElement.appendChild(this.head);
        this.documentElement.appendChild(this.body);
    }

    /* create a new element */
    createElement(tagName) {
        const CustomElement = window.customElements.get(tagName);
        return (CustomElement) ? new CustomElement() : new Element(null, tagName.toUpperCase());
    }

    /* create an element with a namespace */
    createElementNS(namespace, tagName) {
        const element = this.createElement(tagName);
        element.namespace = namespace;
        return element;
    }

    /* create a text node */
    createTextNode(text) {
        return new Text(text);
    }

    /* create a comment node */
    createComment(text) {
        return new Comment(text);
    }

    /* create a document fragment */
    createDocumentFragment() {
        return new DocumentFragment();
    }

    /* create a tree walker */
    createTreeWalker(root) {
        const stack = [root];

        return {
            currentNode: null,
            nextNode() {
                this.currentNode = stack.shift();

                if (this.currentNode) {
                    stack.unshift(...(this.currentNode.childNodes).filter((node) => node instanceof Element));
                }

                return this.currentNode || null;
            }
        };
    }

    /* import a node */
    importNode(node, deep) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }

        if (!deep) {
            while (node.hasChildNodes()) {
                node.removeChild(node.firstChild);
            }
        }

        return node;
    }
}