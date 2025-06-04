FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production=false

# Bundle app source
COPY . .

# Expose application port
EXPOSE 3000

# Default command (development)
CMD ["npm", "run", "dev"]