# Development
FROM node:16.13.2-alpine3.15 AS base

WORKDIR /app

COPY package.json /app

RUN npm install --quiet

COPY . /app
