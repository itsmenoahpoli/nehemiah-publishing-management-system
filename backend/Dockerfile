FROM node:20-alpine

RUN apk add --no-cache openssl mysql-client

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chmod +x wait-for-db.sh start.sh

RUN npx prisma generate

EXPOSE 5000

CMD ["./start.sh"]
