FROM node:lts-alpine@sha256:0eca266c5fe38ba93aebac00e45c9ac1bb7328b0702a6dc10e1a6ea543d49301
# RUN wget https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_amd64.deb
# RUN dpkg -i dumb-init_*.deb
# RUN apk add dumb-init
ENV NODE_ENV production
ENV POSTGRES_ADMIN=horus_admin
ENV POSTGRES_PASSWORD=horus_admin
ENV DB_CONTAINER_NAME=timescale
ENV DB_NAME=horus
ENV DB_PORT=5432
WORKDIR /usr/src/app
COPY --chown=node:node . /usr/src/app
RUN apk add --update npm
RUN npm ci --only=production
USER node
# Add "dumb-init"
CMD ["node", "index.js"]