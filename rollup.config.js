import esbuild from "rollup-plugin-esbuild";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { dependencies } from "./package.json";
import { builtinModules } from "module";

export default {
    input: {
        index: "src/index.js",
        env: "src/env.js"
    },
    output: { dir: "dist", format: "cjs", banner: "/* Copyright (c) 2021 Outwalk Studios */" },
    plugins: [
        resolve(),
        commonjs(),
        esbuild({
            minify: true,
            target: "es2015"
        })
    ],
    external: Object.keys(dependencies).concat(builtinModules)
};