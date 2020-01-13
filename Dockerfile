# build Vue application
FROM node:12 as build-stage
WORKDIR /opt/picontrol/app
COPY app/package*.json ./
RUN npm install
COPY app/ .
RUN npm run build

# install server dependencies and serve application
FROM node:12 as production-stage
WORKDIR /opt/picontrol/server
COPY certs/ /etc/ssl/picontrol
COPY server/package*.json ./
RUN npm install
COPY server/ .
COPY --from=build-stage /opt/picontrol/app/dist public
EXPOSE 443
CMD ["node", "server.js"]