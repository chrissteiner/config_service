# 1. Base Image
FROM node:20-alpine AS base

# 2. App-Verzeichnis
WORKDIR /app

# 3. Abhängigkeiten installieren (Cache-freundlich)
COPY package*.json ./
RUN npm ci --omit=dev

# 4. App-Code kopieren
COPY . .

# 5. Sicherheit: Non‑Root User
RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup
USER nodeuser

# 6. App-Port
EXPOSE 5440

# 7. Startbefehl (Einstieg laut package.json "main")
CMD ["node", "config_service.js"]
