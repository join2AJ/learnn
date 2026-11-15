import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The build is written straight into the Android app's assets so Gradle packages it.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "../android/app/src/main/assets/www",
    emptyOutDir: true,
    target: "es2019",
    chunkSizeWarningLimit: 2000,
    assetsInlineLimit: 0,
  },
});
