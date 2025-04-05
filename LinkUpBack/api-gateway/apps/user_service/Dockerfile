FROM node:lts-alpine

WORKDIR /app


COPY package*.json ./
COPY prisma/ ./prisma/


RUN npm install


COPY . .


CMD ["npm", "run", "start:dev", "--", "user_service"]