# install dependencies
FROM node:gallium-alpine
WORKDIR /usr/src/app

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY src ./src
RUN pnpm run build-stations

ENV PORT=3000

EXPOSE 3000

COPY healthcheck.js ./
HEALTHCHECK --interval=12s --timeout=12s --start-period=30s CMD node healthcheck.js

CMD ["pnpm", "run", "start"]
