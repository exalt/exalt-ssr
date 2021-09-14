export function findWhere(array, func, returnIndex, byValue) {
    let i = array.length;

    while (i--) {
        if (byValue ? array[i] == func : func(array[i])) {
            break;
        }
    }

    return (returnIndex) ? i : array[i];
}

export function splice(array, item, add, byValue) {
    let i = array ? findWhere(array, item, true, byValue) : -1;
    if (~i) (add) ? array.splice(i, 0, add) : array.splice(i, 1);
    return i;
}

export function each(node, call) {
    if (!node) return node;

    if (node.nodeName == "#document-fragment") {
        Array.from(node.childNodes).forEach(call);
    } else {
        call(node);
    }

    return node;
}

export function createAttributeFilter(namespace, name) {
    return (node) => {
        return (node.ns == namespace) && (node.localName.toLowerCase() == name.toLowerCase());
    };
}

export function find(root, call, options = {}) {
    const tree = document.createTreeWalker(root);
    const list =  options.one ? null : [];

    while(tree.nextNode()) {
        if(call(tree.currentNode)) {
            if(options.one) return tree.currentNode;
            list.push(tree.currentNode);
        }
    }

    return list;
}