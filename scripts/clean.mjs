import { globSync } from "tinyglobby";
import * as Fs from "node:fs";
import * as Path from "node:path";

const dirs = [".", ...globSync(["packages/*"], { onlyDirectories: true })];
dirs.forEach((pkg) => {
  console.log(`Cleaning ${pkg}`);
  const files = [".tsbuildinfo", "build", "dist", "coverage", ".turbo"];

  files.forEach((file) => {
    const path = Path.join(pkg, file);
    Fs.rmSync(path, { recursive: true, force: true }, () => {});
  });
});
