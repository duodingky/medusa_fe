# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Medusa integration

This storefront talks to the Medusa Store API. Configure the base URL with
environment variables before starting Nuxt:

```bash
# Required
export NUXT_PUBLIC_MEDUSA_BASE_URL="http://localhost:9000"

# Optional (only needed for publishable-key protected stores)
export NUXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=""
```

The home page shows categories, collections, and products. Use the "Add to cart"
button to create a cart and visit `/cart` to update quantities or remove items.

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
