# build stage
FROM node:20-alpine AS build
ARG ENV=qa
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Copy environment-specific .env file
RUN if [ "$ENV" = "prod" ]; then \
      cp .env.prod .env; \
    else \
      cp .env.qa .env; \
    fi
RUN npm run build:${ENV}

# serve stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080