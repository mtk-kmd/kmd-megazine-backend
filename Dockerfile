FROM node:18.18-alpine3.18

RUN apk add --no-cache python3 make g++ cmake

WORKDIR /usr/src/app

COPY . .

RUN npm install

EXPOSE 8000

CMD ["node", "index.js"]
