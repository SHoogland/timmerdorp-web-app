FROM nginx:stable-alpine

LABEL "org.opencontainers.image.source"="https://github.com/SHoogland/timmerdorp-web-app"

COPY dist/ /usr/share/nginx/html

COPY config/default.conf /etc/nginx/conf.d/default.conf

RUN ln -sf /dev/stdout /var/log/nginx/access.log && ln -sf /dev/stderr /var/log/nginx/error.log

EXPOSE 80