# Third Place CLT

A community events website for Third Place's conversation meetups in Charlotte.
Built with Next.js, React, PostgreSQL/Prisma, Auth.js and Cloudflare Images.

## Repository

- Remote: https://github.com/chrismmt00/third-place-clt.git
- Branch: `main`
- Open `C:\Projects\third-place-clt` as the VS Code folder. This project has its own
  Git repository; the neighboring projects belong to a separate parent repository.

## Local development

Use Node.js 24 LTS and a dedicated local PostgreSQL database.

1. Run `npm ci`.
2. Copy `.env.example` to `.env` and configure credentials privately. The existing `.env` is for production.
3. Set `DATABASE_URL` and a separate `TEST_DATABASE_URL` as explicit shell overrides,
   along with local seed credentials. Local reference values are inactive comments
   in `.env`; there is no `.env.local`. Never run local development against production.
4. Run `npm run db:migrate` and, if a local fixture owner is needed, `npm run db:seed`.
5. Run `npm run dev`.

`npm run verify` runs validation, lint, tests and client-secret checks.
`npm run build` verifies the production build. Public forms use honeypots and rate
limits; no Turnstile keys are required.

## Release and handoff

The repository being available on GitHub does not deploy the website or initialize
production. See [the deployment checklist](docs/DEPLOY.md) for remaining launch
configuration and the explicit first-owner provisioning procedure.

- [Admin guide](docs/ADMIN_GUIDE.md)
- [Backend handoff](docs/BACKEND_HANDOFF.md)
- [Progress](docs/PROGRESS.md)
- [Photo sources and licenses](docs/IMAGE_SOURCES.md)

The private `.env`, credentials, the client agreement and design archive are
ignored and must not be committed.
