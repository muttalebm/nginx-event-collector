# fluentd/Dockerfile
ARG IMAGE_NAME=fluent/fluentd
ARG IMAGE_VERSION=v1.16.2-debian-1.0
ARG HTTP_PROXY=""
ARG HTTPS_PROXY=""
ARG NO_PROXY="localhost,127.0.0.1"
ARG BUILD_MODE=prod
ARG TIMEZONE="Asia/Dhaka"

FROM ${IMAGE_NAME}:${IMAGE_VERSION}
USER root
ARG TOOLS="telnetd curl"
RUN buildDeps="sudo make gcc g++ libc-dev" \
 && apt-get update \
 && apt-get install -yq tzdata \
 && echo "${TIMEZONE}" > /etc/timezone \
        && rm /etc/localtime \
        && dpkg-reconfigure -f noninteractive tzdata \
 && apt-get install -y --no-install-recommends $buildDeps \
 && apt-get install -y ${TOOLS} \
 && sudo gem install fluent-plugin-uri-parser \
 && sudo gem install fluent-plugin-elasticsearch fluent-plugin-uri-parser \
 && sudo gem sources --clear-all \
 && rm -rf /var/lib/apt/lists/* \
 && rm -rf /tmp/* /var/tmp/* /usr/lib/ruby/gems/*/cache/*.gem
ENV TZ="Asia/Dhaka"
COPY ./deploy/data/fluentd/conf /fluentd/etc/


USER fluent