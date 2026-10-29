# Stage 1: build the static files with Node.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# An empty address means "the same site that served this page". The big Nginx sends /api/ to the services.
ENV VITE_API_BASE_URL=""
# The courier names offered in the forms. The services check them again, so a wrong value cannot do harm.
ARG VITE_COURIERS="Courier A,Courier B"
ENV VITE_COURIERS=$VITE_COURIERS
RUN npm run build

# Stage 2: Nginx as a normal user (not root), on port 8080.
FROM nginxinc/nginx-unprivileged:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
