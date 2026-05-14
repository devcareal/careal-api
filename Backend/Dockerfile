# Use a lightweight Node image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Your app listens on port 8080 (Back4app's default)
EXPOSE 8080

# Start the app
CMD [ "node", "server.js" ]