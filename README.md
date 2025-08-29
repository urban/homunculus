
# Homunculus Monorepo

This is a monorepo for AI experiments.

## Overview

This is a TypeScript monorepo using pnpm workspaces, turbo for build orchestration and tsup for building.

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

## Prerequisites and Setup

### Using Nix

Using Nix ensures that all developers have the exact same development environment, eliminating "it works on my machine" problems.

#### Why Nix?

Nix provides several benefits for development:

1. **Reproducible environments**: Everyone on the team gets exactly the same development environment with the same versions of all tools.

2. **Declarative configuration**: All dependencies are explicitly declared in the `flake.nix` file.

3. **Isolation**: The development environment is isolated from your system, preventing conflicts with globally installed packages.

4. **Cross-platform**: Works the same way on macOS, Linux, and WSL on Windows.

5. **Simpler than containerization**: Unlike Docker-based setups that require port mapping and container networking, Nix environments run natively while maintaining isolation. This eliminates the need for volume mounts and container-to-host port exposure, while preserving direct filesystem access to your source code and providing better performance through native execution.

#### Setup Steps

1. Install Nix:

   ```bash
   # For macOS and Linux
   sh <(curl -L https://nixos.org/nix/install) --daemon

   # For more installation options, visit:
   # https://nixos.org/download.html
   ```

2. Enable Flakes (if not already enabled):

   ```bash
   # Add this to ~/.config/nix/nix.conf or /etc/nix/nix.conf
   experimental-features = nix-command flakes
   ```

3. Start a Nix shell with your current shell:

   ```bash
   # From the project root
   nix develop --command "$SHELL"
   ```

   The `-c $SHELL` option starts your current shell inside the Nix environment, which preserves your shell configuration, aliases, and history. This gives you a more comfortable development experience compared to the default Nix shell.

   This will automatically set up all required tools with the correct versions.

4. Install dependencies:

   ```bash
   pnpm install
   ```

## Development Commands

### Building Packages

**Building All Packages**

To build all packages in the monorepo:

```sh
pnpm build
```

**Building a Specific Package**

To build a specific package:

```sh
pnpm --filter agent build
```

### Installing Dependencies

To add dependencies to a specific package:

```sh
# Add a production dependency
pnpm add --filter agent effect

# Add a development dependency
pnpm add -D --filter agent @types/react
```

### Development

Before running any commands, make sure you're in a Nix shell as described above.

```bash
# Start the AI agent
pnpm --filter agent dev
```

### Checking, Linting and Testing

```sh
# Run all type checks
pnpm typecheck

# Run all linting
pnpm lint

# Run tests
pnpm test
```