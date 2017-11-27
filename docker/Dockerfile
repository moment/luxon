FROM bitnami/node:8.9.1-r0-prod

RUN install_packages git

RUN npm install full-icu
RUN npm install -g gulp-cli

ENV NODE_ICU_DATA=/node_modules/full-icu
ENV LIMIT_JEST=yes
ENV CI=yes
ENV TZ=America/New_York
