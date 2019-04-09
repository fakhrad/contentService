FROM node:alpine AS contentservice

WORKDIR /app
COPY . /app 
RUN npm install



