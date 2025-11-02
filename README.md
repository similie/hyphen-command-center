# 🖥️ Hyphen Command Center (UI)

**Hyphen Command Center** is the SvelteKit-based frontend for managing the  
Hyphen ecosystem — a full-stack, open platform by [Similie](https://similie.org)  
for climate and IoT system management, real-time telemetry, and field operations.

It provides a rich interface for interacting with the  
[**Hyphen Command Center API**](https://github.com/similie/hyphen-command-center-api),  
offering device control, firmware builds, MQTT monitoring, and system configuration.

---

## 🚀 Overview

Hyphen Command Center UI is a **TypeScript + SvelteKit** web application  
that provides a management dashboard for the Hyphen IoT ecosystem.

It integrates directly with the [**Hyphen Command Center API**](https://github.com/similie/hyphen-command-center-api)  
to handle:

- Device registration and management
- Firmware builds and artifact streaming
- MQTT telemetry and payload forwarding
- User authentication and configuration management

It also uses **Drizzle ORM** for database access and automatic migrations  
and seeding when run in a containerized environment.

---

## 🧱 Architecture

                 ┌─────────────────────────────┐
                 │ Hyphen Connect Devices       │
                 │ (ESP32, Cellular, etc.)      │
                 └───────────┬──────────────────┘
                             │ MQTT / TLS
                             ▼
                 ┌─────────────────────────────┐
                 │ Hyphen Command Center API    │
                 │ (Node.js + Ellipsies)        │
                 │ REST / SSE / MQTT handling   │
                 └───────────┬──────────────────┘
                             │ REST / SSE
                             ▼
                 ┌─────────────────────────────┐
                 │ Hyphen Command Center (UI)  │
                 │ (SvelteKit + Drizzle ORM)   │
                 │ Device + Build Dashboard    │
                 └───────────┬──────────────────┘
                             │
                             ▼
                 ┌─────────────────────────────┐
                 │ PostgreSQL + Redis          │
                 │ (Persistent State + Cache)  │
                 └─────────────────────────────┘

---

## ⚙️ Core Features

- **Unified Command Dashboard** — monitor devices, builds, and telemetry in real time
- **Drizzle ORM Integration** — database migrations and seeding automatically on boot
- **User Authentication** — secure login with JWT and bcrypt hashing
- **Device Insights** — view online/offline status, map markers, and build status
- **Firmware Management** — trigger OTA or local flash builds via the API
- **Scalable Architecture** — built for horizontal scaling via Docker Compose
- **Multi-Network Support** — connected across webapps, Redis, and DB networks

---

## 🧰 Tech Stack

| Layer            | Technology                                                                        |
| ---------------- | --------------------------------------------------------------------------------- |
| Framework        | [SvelteKit](https://kit.svelte.dev/)                                              |
| Database         | PostgreSQL 17 (via TimescaleDB)                                                   |
| ORM              | [Drizzle ORM](https://orm.drizzle.team/)                                          |
| Caching          | Redis 7                                                                           |
| API Backend      | [Hyphen Command Center API](https://github.com/similie/hyphen-command-center-api) |
| Containerization | Docker + NGINX Reverse Proxy                                                      |
| Language         | TypeScript                                                                        |
| Styling          | Tailwind + Flowbite Svelte                                                        |

---

## 🧾 Prerequisites

- **Docker Desktop** (Mac, Windows, Linux)
- **Node.js 20+** (optional, for local dev)
- **pnpm** (preferred package manager)
- **PostgreSQL 17 / TimescaleDB** and **Redis 7** (included via Docker Compose)

---

## ⚡ Quick Start (Recommended)

The fastest way to deploy Hyphen Command Center and API together  
is using the provided **Docker Compose** configuration.

```bash
docker-compose up --build
```

This launches:

- 4 instances of the SvelteKit UI
- 4 instances of the Command Center API
- PostgreSQL (TimescaleDB)
- Redis
- NGINX load balancer and reverse proxy

## 🧩 Environment Variables

Copy .env.example to .env and modify as needed:

```bash
PUBLIC_API_URL=http://localhost:1612/api/v2/
SIBLING_API_URL=http://hyphen-command-center-api:1612/api/v2/
JWT_CLIENT_SECRET=replace_with_strong_secret
SECURE_HOST=true
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
DEFAULT_EMAIL_ADDRESS=info@similie.org
TZ=Asia/Dili
```

## 🧱 Docker Compose Architecture

By far, the easiest way to get started is to use the docker-compose file included in this repo. Below is the simplified deployment layout (see full version in repository):

```yaml
services:
  nginx:
    image: nginx:stable-alpine
    ports:
      - "4174:4173"
      - "1612:1612"
    volumes:
      - ./container.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - hyphen
      - hyphen-command-center-api

  hyphen:
    build: .
    env_file: .env
    deploy:
      replicas: 4
    environment:
      - DATABASE_URL=postgres://postgres:postgres@db:5432/hyphen
      - SIBLING_API_URL=http://hyphen-command-center-api:1612/api/v2/
      - REDIS_CONFIG_URL=redis://redis:6379/1
    networks:
      - webapps
      - redisnet
      - db-net
    expose:
      - 4173

  hyphen-command-center-api:
    build:
      context: ../Hyphen-CommandCenter-API
    deploy:
      replicas: 4
    expose:
      - "1612:1612"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /tmp/host_builds:/tmp/host_builds
    networks:
      - webapps
      - redisnet
      - db-net

  redis:
    image: redis:alpine
    expose:
      - "6379:6379"

  db:
    image: timescale/timescaledb-ha:pg17
    ports:
      - "5435:5432"
    volumes:
      - pgconfigdata:/var/lib/postgres/data
      - pgconfiglogs:/var/log/postgresql
      - ./sql:/docker-entrypoint-initdb.d
```

## 🧠 Database Initialization

When the SvelteKit container starts for the first time:

1.  Drizzle ORM automatically runs migrations
2.  The seed script creates a default configuration and user:

_Username_ hyphenadmin
_Password_ Admin1234

The password is stored as a bcrypt hash.
You can modify the seed script in src/lib/server/db/seed.ts to fit your environment.

## 🧩 Developer Setup (Local)

If you prefer to develop locally outside Docker:

Once you've cloned the project and installed dependencies with npm install (or pnpm install or yarn), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

The dev port is `5173` or `4173` in production.

Building
To create a production version of your app:

```bash
npm run build
```

You can preview the production build with npm run preview.

To deploy your app, you may need to install an adapter for your target environment.

🔗 Integration with the API

The UI interacts with the Hyphen Command Center API￼
through the configured SIBLING_API_URL.

It communicates over REST and SSE to handle:
• Device registration and firmware builds
• MQTT message streams
• Configuration sync and telemetry visualization

All authenticated API calls use JWT tokens managed via the Ellipsies session layer.

⸻

## 🧠 Scaling & Load Balancing

Both the frontend (hyphen) and API (hyphen-command-center-api)
are designed for horizontal scaling using Docker Swarm or Compose replicas.

The NGINX reverse proxy (nginx) routes traffic to all UI and API replicas,
handling load balancing automatically.

⸻

## 🤝 Contributing

We welcome open-source contributions to improve the Hyphen ecosystem. 1. Fork the repository 2. Create a feature branch 3. Submit a pull request describing your change

Please follow existing coding conventions and include clear commit messages.

⸻

## 🪪 License

This project is distributed under the GNU General Public License v3 (GPLv3)
with additional commercial-use terms.

Community and nonprofit use is fully open under GPLv3.
Commercial deployment or derivative services require a commercial license from Similie.
Contact: licensing@similie.org￼

See LICENSE.md￼ for full terms.

⸻

## 🌍 About Similie

Similie is a technology company dedicated to climate resilience and community empowerment.
We build open and interoperable systems that help governments, NGOs, and enterprises
manage infrastructure, weather, and environment through IoT and data-driven intelligence.

🌐 https://similie.com
📧 info@similie.org￼

⸻

---

## 🧭 Related Projects

| Project                                                                               | Description                                                                                                                                                  |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [**Hyphen Command Center API**](https://github.com/similie/hyphen-command-center-api) | The backend API that manages MQTT connections, firmware builds, and the device registry for all Hyphen systems.                                              |
| [**Hyphen Connect**](https://github.com/similie/hyphen-connect)                       | The ESP32-compatible client library and reference firmware that allows hardware devices to communicate securely with the Hyphen Command Center.              |
| [**Ellipsies**](https://github.com/similie/ellipsies)                                 | The TypeScript backend microservice framework built by Similie, providing decorators, routing-controllers, and TypeORM integration for the Hyphen ecosystem. |

---

## 🪪 License

This project is licensed under the **GNU General Public License v3 (GPLv3)**  
with additional **commercial-use terms** from Similie.

> Community and nonprofit use is open and encouraged.  
> Commercial or for-profit deployments, hosted services, or derivative works  
> require a commercial license agreement with **Similie**.
>
> 📩 Contact: [licensing@similie.org](mailto:licensing@similie.org)

See the full license in [`LICENSE.md`](./LICENSE.md).

---

## 🌍 About Similie

**Similie** is a technology company building digital infrastructure for climate resilience  
and community empowerment across Southeast Asia and beyond.

We develop open, modular systems for IoT data collection, early warning, and analytics,  
enabling governments, NGOs, and citizens to make data-driven decisions that save lives.

🌐 [https://similie.org](https://similie.org)  
📧 [hello@similie.org](mailto:hello@similie.org)  
🐙 [GitHub @similie](https://github.com/similie)

---

**Hyphen Command Center (UI)**  
© 2025 [Similie](https://similie.org) — All Rights Reserved  
Licensed under GPLv3 with Similie Commercial Use Terms
