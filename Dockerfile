FROM node:22-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build

RUN rm -rf node_modules

RUN npm install --omit=dev

EXPOSE 3000

CMD npm run db:migrate ; npm run start
