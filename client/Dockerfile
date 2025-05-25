# client/Dockerfile
FROM node:18-alpine AS build

WORKDIR /app

# Copy client package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy client source code
COPY . .

# Build the React app
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]