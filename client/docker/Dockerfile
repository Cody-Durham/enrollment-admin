# the addition of --platform linux/amd64 is for the m1 chip to recognize this OS
FROM --platform=linux/amd64 node:18-alpine

# Create app directory
WORKDIR /usr/src/app

COPY ./server/package*.json ./

# Bundle app source
COPY ./dist/. ./public/dist/
COPY ./favicon.ico ./public/favicon.ico
COPY ./public/index.html ./public/index.html
COPY ./server/server.js ./server.js

RUN npm install

EXPOSE 8080

CMD [ "node", "server.js" ]
