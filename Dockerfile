# To Build: docker build -t <your username>/activecollab-discord-bot .
# To Run: docker run -p 443:8443 -d <your username>/activecollab-discord-bot
# To Stop: docker stop <container id>
# To go inside: docker exec -it <container id> /bin/bash

FROM node:carbon

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Set the port for prod, this will override the default set in app.ts
ENV port 443

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 443

CMD [ "npm", "start" ]
