FROM node:18-alpine
WORKDIR /app

# Create uploads directory with proper permissions
RUN mkdir -p public/uploads/breeder-profiles \
    public/uploads/grown-dogs \
    public/uploads/puppy-dogs \
    && chown -R node:node /app

# Create volume for persistent storage
VOLUME /app/public/uploads

COPY package*.json ./
RUN npm install --production
COPY --chown=node:node . .

# Switch to non-root user
USER node

EXPOSE 4000
CMD ["npm", "start"]
