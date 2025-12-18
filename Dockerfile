FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
#RUN npm audit fix --force
# If you are building your code for production
# RUN npm ci --only=production
# Bundle app source
COPY . ./

# Environment variable for Prisma to avoid telemetry prompts
ENV PRISMA_GENERATE_SKIP=true

# Generate Prisma client
RUN npx prisma generate


#Timezone
ENV TZ=Africa/Kampala

# For PostgreSQL, push the schema, seed, then start the server
CMD ["sh","-c","npx prisma db push && node seed.js && node src/server.js"]