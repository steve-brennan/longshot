FROM node:alpine

RUN mkdir /longshot
WORKDIR /longshot

RUN apk update
RUN apk add --no-cache make gcc g++ python
RUN apk add bash


EXPOSE 3000
