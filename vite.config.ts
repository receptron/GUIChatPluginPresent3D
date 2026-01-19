import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    dts({
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.vue"],
      outDir: "dist",
      rollupTypes: false,
    }),
  ],
  build: {
    lib: {
      entry: {
        core: resolve(__dirname, "src/core/index.ts"),
        vue: resolve(__dirname, "src/vue/index.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "vue",
        "gui-chat-protocol",
        "gui-chat-protocol/vue",
        "three",
        "three-bvh-csg",
      ],
      output: {
        globals: {
          vue: "Vue",
          three: "THREE",
        },
      },
    },
    cssCodeSplit: false,
  },
});
