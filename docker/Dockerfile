FROM library/node:10-slim

RUN npm install full-icu

ENV NODE_ICU_DATA=/node_modules/full-icu
ENV LANG=en_US.utf8
ENV LIMIT_JEST=yes
ENV CI=yes
ENV TZ=America/New_York
