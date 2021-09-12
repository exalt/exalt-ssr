import esbuild from "rollup-plugin-esbuild";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { dependencies } from "./package.json";
import { builtinModules } from "module";

export default {
    input: "src/index.js",
    output: { file: "dist/index.js", format: "cjs", banner: "/* Copyright (c) Outwalk Studios */" },
    plugins: [
        resolve(),
        commonjs(),
        esbuild({
            target: "es2015",
            minify: true
        })
    ],
    external: Object.keys(dependencies).concat(builtinModules)
};