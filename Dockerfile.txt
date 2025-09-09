# ===== Base build image =====
FROM node:20-bullseye AS base

# Install Chromium deps for Puppeteer
RUN apt-get update && apt-get install -y             ca-certificates             fonts-liberation             libasound2             libatk-bridge2.0-0             libatk1.0-0             libc6             libcairo2             libcups2             libdbus-1-3             libdrm2             libexpat1             libgbm1             libglib2.0-0             libgtk-3-0             libnspr4             libnss3             libpango-1.0-0             libx11-6             libx11-xcb1             libxau6             libxcb1             libxcomposite1             libxcursor1             libxdamage1             libxext6             libxfixes3             libxi6             libxrandr2             libxrender1             libxss1             libxtst6             wget             xdg-utils          && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json .
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production             PUPPETEER_CACHE_DIR=/app/.cache/puppeteer

RUN useradd -m -u 1001 bot && chown -R bot:bot /app
USER bot

EXPOSE 3000

CMD ["node", "src/index.js"]
