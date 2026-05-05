import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["index.ts"],
  format: "esm",
  // 强制输出 .js 扩展名，避免 npm bin 字段不支持 .mjs 的问题
  outExtensions: () => ({ js: ".js" }),
  clean: true,
  // Node.js 内置模块不打包进产物
  external: [
    "events",
    "fs",
    "path",
    "os",
    "util",
    "crypto",
    "url",
    "querystring",
    "stream",
    "buffer",
    "process",
  ],
  outDir: "dist",
  dts: false,
});
