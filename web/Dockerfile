# FROM node:11.10.0 AS builder
# COPY . /app
# WORKDIR /app
# RUN npm install
# CMD ["npm", "run", "start"]


# Setup for static web server
# wlchn/gostatic is very old image recommended to use nginx or apache
# Set them up to serve single page aplications

# FROM wlchn/gostatic:latest
# ENV CONFIG_FILE_PATH /srv/http
# COPY --from=builder /app/build /srv/http
# COPY ./env.sh /env.sh
# ENTRYPOINT ["sh", "/env.sh"]
# CMD ["/goStatic"]
FROM node:11.10.0 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


# FROM nginx:latest
# COPY --from=builder /app/build /usr/share/nginx/html
# COPY ./env.sh /env.sh
# ENTRYPOINT ["sh", "/env.sh"]
# CMD ["nginx", "-g", "daemon off;"]

FROM nginx
COPY ./nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
COPY --from=builder /app/build /usr/share/nginx/html



# To make any changes in forntend or (web section), uncomment line 1 to 5 and stop the web container, also comment line 18 to 23.

