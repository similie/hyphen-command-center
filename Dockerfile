FROM node:20.19.2-bookworm
ENV NODE_OPTIONS="--max-old-space-size=4096"
# RUN apk add --no-cache libc6-compat
RUN apt-get update && apt-get install -y python3 make g++
RUN npm install -g pnpm

ENV NODE_ENV development

WORKDIR /app

COPY .npmrc ./
# RUN echo "node-linker=hoisted" >> .npmrc

COPY patches ./patches

COPY package.json pnpm-lock.yaml ./
# RUN pnpm install
RUN pnpm install --production=false

#RUN pnpm exec patch-package

# RUN pnpm add -D onnxruntime-node

ENV NODE_ENV production
COPY . .
# RUN pnpm run build 
ENV PUBLIC_API_URL=http://localhost:1612/api/v2/
ENV PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
# RUN pnpm rebuild bcrypt && \
#     BCRYPT_PATH=$(find node_modules/.pnpm -type d -path "*/bcrypt@*" | head -n 1) && \
#     mkdir -p node_modules/bcrypt/lib && \
#     cp -r "$BCRYPT_PATH/node_modules/bcrypt/lib/binding" node_modules/bcrypt/lib/
# RUN pnpm rebuild bcrypt
# RUN mkdir -p node_modules/bcrypt/lib/binding/napi-v3 && \
#     find node_modules -type f -name 'bcrypt_lib.node' \
#       -exec cp {} node_modules/bcrypt/lib/binding/napi-v3/ \;

RUN pnpm --reporter=append-only run build

# c938316bde540963a92a96a0 postgres password
EXPOSE 4173
CMD ["pnpm", "run", "preview"]