import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "node",
  target: "node20",
  clean: true,
  splitting: false,
  
  // Enable TypeScript paths resolution
  tsconfig: "tsconfig.json",

  // Externalize all dependencies
  external: [
    /^@effect\//,
    "effect"
  ]
});