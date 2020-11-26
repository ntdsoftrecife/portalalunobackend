FROM node:current-slim
WORKDIR /usr/src/app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 8013
CMD [ "npm", "start" ]

# docker build:
# docker build --tag ntdalunoprivatebackend:2.0 .
# docker build --tag ntdalunoprivatebackend:dev .

# run docker image
# docker run --publish 8013:8013 --detach --name napb ntdalunoprivatebackend:2.0
# docker run --publish 38013:8013 --detach --name napbdev ntdalunoprivatebackend:dev

# remove image
# docker rm --force napb
# docker rm --force napbdev