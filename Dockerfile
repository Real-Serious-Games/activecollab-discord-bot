# To Build: docker build -t <your username>/activecollab-discord-bot .
# To Run: docker run -p 80:8080 -d <your username>/activecollab-discord-bot
# To Stop: docker stop <container id>
# To go inside: docker exec -it <container id> /bin/bash

FROM node:carbon

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install --only=production
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 8080

CMD [ "npm", "build" ]
CMD [ "npm", "start" ]
