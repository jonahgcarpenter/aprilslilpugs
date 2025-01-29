FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./ 

# Install production dependencies only
RUN npm ci --only=production

# Copy remaining app source code
COPY . .

EXPOSE 3000

CMD ["npm", "start"]

