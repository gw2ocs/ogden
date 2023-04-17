FROM node:13-alpine

RUN apk add --no-cache git

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

CMD [ "npm", "start" ]