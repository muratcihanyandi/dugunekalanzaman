FROM nginx:alpine

COPY nginx-conf/ /etc/nginx/conf.d/
COPY site/ /usr/share/nginx/html/

EXPOSE 33465
