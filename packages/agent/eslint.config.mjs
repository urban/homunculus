import localRules from "eslint-plugin-local-rules";
import base from "@config/eslint";

export default [
  ...base,
  {
    plugins: {
      "local-rules": localRules,
    },
    settings: {
      "local-rules": {
        rulesPaths: ["./eslint-local-rules.mjs"],
      },
    },

    rules: {
      "local-rules/no-opaque-instance-fields": "error",
    },
  },
  {
    files: ["./src/**/*"],
    rules: {
      "no-console": "error",
    },
  }
];