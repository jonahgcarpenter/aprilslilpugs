FROM node:18-alpine
WORKDIR /app

# Create uploads directory structure
RUN mkdir -p public/uploads/breeder-profiles \
    public/uploads/grown-dogs \
    public/uploads/puppy-dogs

COPY package*.json ./
RUN npm install
COPY . .

# Make sure the upload directories are writable
RUN chown -R node:node public/uploads

# Switch to non-root user
USER node

EXPOSE 4000
CMD ["npm", "start"]
