FROM node:lts

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ./wait-for-it.sh linkup_redis:6379 -- npm run start