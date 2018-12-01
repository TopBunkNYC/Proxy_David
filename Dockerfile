FROM node:8
# Set the working directory to /app
WORKDIR /app

RUN npm install pm2 -g
COPY package*.json ./

RUN npm install --only=production

# Copy the current directory contents into the container at /app
COPY . .

EXPOSE 8000

CMD ["pm2-runtime", "server.js" ]
