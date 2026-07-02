FROM node:26-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY index.html vite.config.ts tsconfig.json tsconfig.app.json eslint.config.js prettier.config.cjs ./
COPY src ./src
RUN npm ci
RUN npm run build

FROM nginx:1.31-alpine
COPY --from=build /app/dist/client /usr/share/nginx/html
EXPOSE 80
