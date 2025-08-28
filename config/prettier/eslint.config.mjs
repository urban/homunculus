import base from "@config/eslint";

export default [
  ...base,
  {
    files: ["./src/**/*"],
    rules: {
      "no-console": "error",
    },
  }
];