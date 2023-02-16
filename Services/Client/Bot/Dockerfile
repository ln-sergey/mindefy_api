FROM node:16-alpine as builder

WORKDIR /app

ADD . /app

RUN npm i --no-optional && npm run build

FROM node:16-alpine as runner

WORKDIR /app

COPY --from=builder /app .

CMD ["npm", "run", "start:prod"]