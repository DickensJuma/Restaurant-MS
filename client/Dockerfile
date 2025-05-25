# client/Dockerfile
FROM node:18-alpine AS build

WORKDIR /app

# Copy client package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy client source code
COPY . .

# Build the React app
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration (optional)
COPY nginx.conf /etc/nginx/nginx.conf 2>/dev/null || echo "No custom nginx config found"

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]