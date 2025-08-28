
# Homunculus Monorepo

This is a TypeScript monorepo using pnpm workspaces, turbo for build orchestration, and tsup for bundling.

## Structure

```
├── config/
│   └── eslint/              # Shared ESLint config
│   └── prettier/            # Shared Prettier config 
│   └── typescript/          # Shared TypeScript config
├── packages/
│   └── agent/               # AI agent
├── turbo.json               # Turbo build configuration
└── package.json             # Root package with scripts
```

## Key Features

- **Pure ESM**: All packages use `"type": "module"`
- **tsx Development**: Packages run directly from TypeScript source in dev mode
- **Turbo Caching:**: Command outputs are cached for faster Developer Experience (DX)

## Development Commands

### Building

- `pnpm build` - Build all packages via turbo
- `pnpm -r exec tsc -b --clean` - Clean TypeScript composite cache

### Development

- `pnpm dev` - Run all packages in dev mode (parallel)
- `cd packages/agent && pnpm dev` - Run Agent in dev mode with tsx

### Testing, Linting & Type Checking

- `pnpm test` - Run tests across all packages
- `pnpm lint` - Run linting across all packages
- `pnpm typecheck` - Run type checking across all packages

## TypeScript Configuration

The monorepo uses TypeScript project references with composite builds:

- **tsconfig.base.json**: Shared compiler options, paths mapping
- **Individual tsconfig.json**: Each package has `composite: true`, `rootDir: "./src"`, `outDir: "./dist"`
