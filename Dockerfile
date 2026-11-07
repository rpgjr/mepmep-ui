# ---- build stage: turn the React source into static files ----
FROM node:22-alpine AS build
WORKDIR /app
# Copy package files first so Docker can cache "npm ci" between builds
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# "/api" means: call the same website, nginx forwards it to the backend
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- run stage: nginx serves the files ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
