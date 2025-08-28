export default {
  "*.{ts,tsx}": ["pnpm --filter agent exec prettier --write", "pnpm --filter agent exec eslint --fix"]
};

