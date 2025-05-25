# Use Node.js LTS image
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose the port your server runs on (change if not 5000)
EXPOSE 5001

CMD ["npm", "start"]