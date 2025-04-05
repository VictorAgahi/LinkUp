FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma/ ./prisma/

RUN npm install

RUN npx prisma generate

COPY . .

CMD ["npm", "run", "start:dev", "--", "auth"]