# build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Copy .env.qa to .env for build
RUN if [ -f .env.qa ]; then cp .env.qa .env; fi
RUN npm run build

# serve stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# (CRA uses /app/build instead of /app/dist)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080