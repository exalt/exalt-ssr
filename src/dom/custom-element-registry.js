export class CustomElementRegistry {

    constructor() {
        this.promises = {};
        this.registry = {};
    }

    /* define a custom element */
    define(name, func) {
        if(this.registry[name]) {
            throw new Error(`Failed to execute "define" on "CustomElementRegistry": this name has already been used with this registry`);
        }

        for(let registryName in this.registry) {
            if(this.registry[registryName] == func) {
                throw new Error(`Failed to execute "define" on "CustomElementRegistry": this constructor has already been used with this registry`);
            } 
        }

        this.registry[name] = func;

        if(this.promises[name]) {
            this.promises[name]();
            delete this.promises[name];
        }
    }

    /* get an element from the registry */
    get(name) {
        return this.registry[name];
    }

    /* resolves when a custom element is defined */
    whenDefined(name) {
        return new Promise((resolve) => {
            if(this.registry[name]) resolve();
            else this.promises[name] = resolve;
        });
    }
}