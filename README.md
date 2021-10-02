# Exalt SSR
A module to render web components on the server.
Full documentation is available [here](https://www.exaltjs.com/docs/#exalt-ssr)

![Actions](https://github.com/exalt/exalt-ssr/workflows/build/badge.svg)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/exalt/exalt-ssr/blob/main/LICENSE)
[![Donate](https://img.shields.io/badge/patreon-donate-green.svg)](https://www.patreon.com/outwalkstudios)
[![Follow Us](https://img.shields.io/badge/follow-on%20twitter-4AA1EC.svg)](https://twitter.com/exaltjs)

---

## Installation

You can install @exalt/ssr using npm:

```
npm install @exalt/ssr
```

---

## Getting Started

@exalt/ssr provides 2 functions to render web components on the server.

- `loadBundle(path)` - initalizes the DOM environment and loads the application bundle.
- `renderToString(component, callback)` - renders a component to a string.

The DOM environment provided is a subset of the DOM spec and is designed to render exalt components,
however as long as the required apis are provided any web component can be rendered.
@exalt/ssr also provides access to the fetch api for loading dynamic data on the server.

When a shadow root is detected it will be rendered as a [declarative shadow root](https://web.dev/declarative-shadow-dom/).

**Example - Rendering the app component**
```js
import { loadBundle, renderToString } from "@exalt/ssr";
import path from "path";

const bundlePath = path.join(process.cwd(), "dist", "index.js");

/* loadBundle returns the bundle exports, in this case it returns the App component */
const { App } = loadBundle(bundlePath);
const html = renderToString(new App());

console.log(html);
```

**Example - Rendering the app component with callback**
```js
import { loadBundle, renderToString } from "@exalt/ssr";
import path from "path";

const bundlePath = path.join(process.cwd(), "dist", "index.js");

/* loadBundle returns the bundle exports, in this case it returns the App component */
const { App } = loadBundle(bundlePath);
const html = renderToString(new App(), (currentNode) => {
    console.log(`Rendering: ${currentNode.nodeName}`);
});

console.log(html);
```

---

## Reporting Issues

If you are having trouble getting something to work with exalt or run into any problems, you can create a new [issue](https://github.com/exalt/exalt-ssr/issues).

If this framework does not fit your needs or is missing a feature you would like to see, let us know! We would greatly appreciate your feedback on it.

---

## License

Exalt SSR is licensed under the terms of the [**MIT**](https://github.com/exalt/exalt-ssr/blob/main/LICENSE) license.
