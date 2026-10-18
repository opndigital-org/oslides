### Regenerate Types
pnpm --filter app exec openapi-typescript http://localhost:8600/openapi.json -o src/lib/api/schema.d.ts