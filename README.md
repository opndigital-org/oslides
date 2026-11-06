<p align="center">
  <a href="https://oslides.opndigital.org">
    <img src=".github/assets/logo.svg" alt="oSlides" width="150" />
  </a>
</p>

<h1 align="center">oSlides</h1>

<p align="center">
  <strong>Markdown-native slides integrated with in-slide live coding.</strong>
</p>


## Quick start
Please read [CONTRIBUTING.md](https://github.com/opndigital-org/oslides/blob/main/CONTRIBUTING.md) before creating an Issue or Pull Request.

```bash
# 1. Fork, Clone and install
git clone https://github.com/{USER}/oslides.git
cd oslides
pnpm install

# 2. Start local Supabase (Postgres + Auth on docker)
pnpm supabase:start

# 3. Copy env files and fill in the values Supabase printed
cp api/.dev.vars.example api/.dev.vars
cp app/.env.example app/.env

# 4. Run api & app side-by-side
pnpm dev:api  # Workers dev - http://localhost:8600
pnpm dev:app  # Vite dev    - http://localhost:5173
```
