FROM node:14-alpine as base

WORKDIR /var/app

COPY . /var/app/

RUN yarn --force --non-interactive --frozen-lockfile --ignore-optional

# Add Tini
ENV TINI_VERSION v0.18.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static /tini
RUN chmod +x /tini

ENTRYPOINT ["/tini", "--"]

# start the app
CMD [ "yarn", "run", "start" ]
