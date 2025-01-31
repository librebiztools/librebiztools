[![Build & Test](https://github.com/librebiztools/librebiztools/actions/workflows/app.yml/badge.svg)](https://github.com/librebiztools/librebiztools/actions/workflows/app.yml)

# LibreBizTools

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the Postgres database with docker compose

```bash
docker compose up
```

Apply the database migrations

```bash
npm run db:migrate
```

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

Built with ❤️ using React Router.
