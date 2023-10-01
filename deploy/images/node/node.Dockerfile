ARG NODE_VERSION=20
ARG NODE_IMAGE_TYPE=bullseye-slim

ARG HTTP_PROXY=""
ARG HTTPS_PROXY=""
ARG NO_PROXY="localhost,127.0.0.*"

ARG APP_NAME="dynamic_db_worker"
ARG APP_ENV="development"
ARG TZ="Asia/Dhaka"
ARG LOG_LEVEL="debug"
ARG LOG_LOCATION="/usr/src/app/logs/dynamic_db_worker.log"
ARG LOG_MAX_KEEP="14d"
ARG LOG_MAX_SIZE="100m"
ARG MAINTAINER="Abdul Muttaleb<abdul.maruf@banglalink.net>"

FROM node:${NODE_VERSION}-${NODE_IMAGE_TYPE}

LABEL maintainer = ${MAINTAINER}

ENV APP_NAME="${APP_NAME}" \
    APP_ENV="${APP_ENV}" \
    APP_URL="${APP_URL}" \
    TZ=Asia/Dhaka \
    NODE_TLS_REJECT_UNAUTHORIZED="${NODE_TLS_REJECT_UNAUTHORIZED}" \
    LOG_LEVEL="${LOG_LEVEL}" \
    LOG_LOCATION="${LOG_LOCATION}" \
    LOG_MAX_KEEP="${LOG_MAX_KEEP}" \
    LOG_MAX_SIZE="${LOG_MAX_SIZE}"

# Proxy
ENV http_proxy="${HTTP_PROXY}" \
    https_proxy="${HTTPS_PROXY}" \
    no_proxy="${NO_PROXY}"

WORKDIR /usr/src/app

COPY ./codes/worker /usr/src/app

RUN if [ ! -z "${HTTP_PROXY}" ]; then \
            npm config set proxy "${HTTP_PROXY}" && \
            yarn config set proxy "${HTTP_PROXY}" \
        ;fi && \
        if [ ! -z "${HTTPS_PROXY}" ]; then \
            npm config set https-proxy "${HTTPS_PROXY}" && \
            yarn config set https-proxy "${HTTPS_PROXY}" \
        ;fi
RUN apt-get update \
    && apt-get install -yq tzdata \
    && dpkg-reconfigure -f noninteractive tzdata \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone \
    && yarn config set "strict-ssl" false \
    && yarn add -G typescript tsc ts-node \
    && yarn install \
    && yarn run build



# CMD ['yarn',"run","start"]