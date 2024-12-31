FROM node:18-alpine
WORKDIR /app

# Create uploads directory structure and set permissions correctly
RUN mkdir -p public/uploads/breeder-profiles \
    && mkdir -p public/uploads/profile-pictures \
    && chown -R node:node /app \
    && chmod -R 755 /app/public

# Copy package files first for better caching
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm install --production

# Copy remaining files
COPY --chown=node:node . .

# Ensure uploads directory permissions persist after copy
RUN chmod -R 755 /app/public

# Create volume mount points
VOLUME [ "/app/public/uploads/breeder-profiles", "/app/public/uploads/profile-pictures" ]

# Switch to non-root user
USER node

EXPOSE 4000
CMD ["npm", "start"]