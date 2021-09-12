declare module "@exalt/ssr" {

    export interface Bundle {
        [key: string]: any;
    }

    export function loadBundle(path: string): Bundle;
    export function renderToString(component: any): string;
}