FROM node:20.19.2-bookworm
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN apt-get update && apt-get install -y python3 make g++
RUN npm install -g pnpm

ENV NODE_ENV development

WORKDIR /app

COPY .npmrc ./
COPY patches ./patches

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --production=false
ENV NODE_ENV production
COPY . .
ENV PUBLIC_API_URL=http://localhost:1612/api/v2/
ENV PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX

RUN pnpm --reporter=append-only run build

EXPOSE 4173
CMD ["pnpm", "run", "preview"]