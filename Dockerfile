# Gunakan image resmi Node.js
FROM node:20-slim

# Install dependencies untuk Chromium
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm-dev \
    libxss1 \
    lsb-release \
    xdg-utils \
    libxshmfence1 \
    --no-install-recommends \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Buat direktori kerja
WORKDIR /app

# Copy package dan install
COPY package.json ./
RUN npm install

# Copy semua file bot
COPY . .

# Jalankan bot
CMD ["npm", "start"]
