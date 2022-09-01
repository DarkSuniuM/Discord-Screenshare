FROM node:16-buster-slim

WORKDIR /Discord-Screenshare

ARG DEBIAN_FRONTEND=noninteractive
ARG TZ=Etc/UTC

RUN apt-get update \ 
    && apt-get install -y python3 make gcc g++ chromium-driver \
    && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile 

COPY . .

RUN yarn build

# Start Bot
CMD ["yarn", "start"]