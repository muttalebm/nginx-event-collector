ARG IMAGE_NAME=nginx
ARG IMAGE_VERSION=1.25.2

FROM ${IMAGE_NAME}:${IMAGE_VERSION}
LABEL maintainer="Abdul Muttaleb Maruf<abdul.maruf@banglalink.net>"

COPY ./deploy/data/nginx/nginx.conf /etc/nginx/nginx.conf
ARG HTTP_PROXY=""
ARG HTTPS_PROXY=""
ARG WORK_DIR_PATH="/usr/src/app"
ARG NO_PROXY="localhost,127.0.0.*"
ARG BUILD_MODE="prod"
ARG TIMEZONE="Asia/Dhaka"
ARG APT_DEPENDENCIES="nano vim telnet"
USER root
RUN echo "-- Configure Timezone --" \
        && echo "${TIMEZONE}" > /etc/timezone \
        && rm /etc/localtime \
        && dpkg-reconfigure -f noninteractive tzdata \
        && echo "-- Install Dependencies --" \
        && apt-get update -y \
        && apt-get install -y --no-install-recommends ${APT_DEPENDENCIES} \
        && echo "-- Cleanup Junks --" \
        && apt-get autoremove -y \
        && apt-get clean -y \
        && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
        && echo "-- Symlink creating --" \
        && ln -sf /dev/stdout /var/log/nginx/access.log \
        && ln -sf /dev/stderr /var/log/nginx/error.log \
        && echo "-- Generating dhparam.pem --" \
        && mkdir -p /etc/nginx/ssl \
        && openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 \
                -nodes -keyout /etc/nginx/ssl/rootCA.key -out /etc/nginx/ssl/rootCA.crt -subj "/CN=localhost" \
                -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:10.0.0.1" \
        && openssl dhparam -out /etc/nginx/dhparam.pem 2048 



WORKDIR ${WORK_DIR_PATH}

RUN mkdir -p /var/cache/ \
        && chown -R nginx:nginx /usr/src/app /var/cache/nginx/ /etc/nginx/ /var/run/

USER nginx