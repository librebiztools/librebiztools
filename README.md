# Tickflo

[![Build & Test](https://github.com/tickflo/tickflo/actions/workflows/app.yml/badge.svg)](https://github.com/tickflo/tickflo/actions/workflows/app.yml)

Tickflo is an open-source business toolkit designed to streamline workflows and enhance productivity. Built with ❤️ using React Router, it provides a modern, user-friendly interface with seamless back-end integration.

## 🚀 Getting Started

### Prerequisites

Before setting up the project, ensure you have the following installed:

- Node.js
- pnpm (recommended package manager)
- Docker (for database services)

### Installation

1 Install pnpm if you haven't already:

```bash
npm install -g pnpm
```

2. Install project dependencies:

```bash
pnpm install
```

### Development

1. Copy the default environment variables:

```bash
cp .env.example .env
```

2. Start the PostgreSQL database using Docker Compose:

```bash
docker compose up -d
```

3. Start the development server with Hot Module Replacement (HMR):

```bash
pnpm dev
```

Your application will be available at http://localhost:3000.

## 📦 Building for Production

To create an optimized production build:

```bash
pnpm build
```

To start the production server:

```bash
pnpm start
```

## 🐳 Running via Docker

A prebuilt Docker image is available on GitHub Container Registry (GHCR).

### Example `compose.yml`

```yml
name: tickflo

services:
  app:
    image: ghcr.io/tickflo/tickflo:master
    container_name: tickflo-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      POSTGRES_HOST: tickflo-db
      POSTGRES_USER: tickflo
      POSTGRES_PASSWORD: password
      POSTGRES_DB: tickflo
      BASE_URL: http://localhost:3000
    depends_on:
      - db

  db:
    image: "postgres:17.2-bookworm"
    container_name: tickflo-db
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: tickflo
      POSTGRES_PASSWORD: password
      POSTGRES_DB: tickflo
```

## 📜 License

Tickflo is released under the AGPLv3 License.

---

Contributions are welcome! Feel free to submit issues or pull requests to help improve Tickflo.
