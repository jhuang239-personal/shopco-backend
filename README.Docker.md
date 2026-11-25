### Building and running your application

When you're ready, start your application by running:
`docker compose up --build`.

Your application will be available at http://localhost:3000.

### Deploying your application to the cloud

First, build your image, e.g.: `docker build -t myapp .`.
If your cloud uses a different CPU architecture than your development
machine (e.g., you are on a Mac M1 and your cloud provider is amd64),
you'll want to build the image for that platform, e.g.:
`docker build --platform=linux/amd64 -t myapp .`.

Then, push it to your registry, e.g. `docker push myregistry.com/myapp`.

Consult Docker's [getting started](https://docs.docker.com/go/get-started-sharing/)
docs for more detail on building and pushing.

### References
* [Docker's Node.js guide](https://docs.docker.com/language/nodejs/)
### Automated deployment (no SSH)

`.github/workflows/backend-deploy.yml` runs on every push to `main`:

1. **build** (GitHub-hosted): builds the image and pushes it to GHCR as `ghcr.io/<owner>/shopco-backend:<commit-sha>` and `:latest`.
2. **deploy** (self-hosted runner on the server): pulls the SHA-tagged image, runs `prisma migrate deploy`, then `docker compose up -d`.

The runner connects out to GitHub over HTTPS, so the server needs no inbound SSH and GitHub holds no SSH key.

#### One-time server setup

1. Install Docker Engine and the compose plugin, and make sure the external `proxy` network exists.
2. Create the deploy directory and its `.env` (start from `.env.example`). Keep it readable only by the runner user:
   ```bash
   mkdir -p ~/apps/shopco-backend && cp .env.example ~/apps/shopco-backend/.env && chmod 600 ~/apps/shopco-backend/.env
   ```
   Set `DEPLOY_DIR` as a repository variable if you use a different path.
3. Register a self-hosted runner: GitHub repo → **Settings → Actions → Runners → New self-hosted runner**. Give it the label `shopco-backend`, install it as a service (`sudo ./svc.sh install && sudo ./svc.sh start`), and add the runner user to the `docker` group.
4. Optional: GitHub repo → **Settings → Environments → production** to require manual approval before each deploy.

Use self-hosted runners only with a private repository. Anyone who can open a pull request on a public repo could run code on your server.

#### Rollback

Migrations are forward-only, so roll back the container and leave the schema alone:

```bash
cd ~/apps/shopco-backend
SHOPCO_IMAGE=ghcr.io/<owner>/shopco-backend SHOPCO_TAG=<previous-sha> docker compose up -d shopco-backend
```

#### Database

- Schema changes: edit `prisma/schema.prisma`, then run `pnpm db:migrate:dev --name <change>` locally and commit the new folder under `prisma/migrations/`.
- Production migrations run automatically in the deploy job. To run them by hand: `pnpm db:migrate:deploy`.
