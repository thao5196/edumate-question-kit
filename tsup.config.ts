import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: true, // code-split cho lazy loading
  treeshake: true,
  external: ["react", "react-dom", "react-blurhash", "react-intersection-observer", "react-medium-image-zoom", "react-use-measure"],
  // sau khi build JS, chạy thêm tailwind để generate CSS
});
