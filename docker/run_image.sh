#!/bin/bash

docker build --rm -t postman/apidocs:latest -f $(pwd)/docker/Dockerfile .

docker run \
--name postman-apidocs \
-v $(pwd):/usr/src/app \
--dns=10.255.255.254 \
--dns=8.8.8.8 \
-p 4001:4001 \
--expose 4001 \
-a stdout \
-it \
--rm \
--workdir /usr/src/app \
postman/apidocs:latest yarn build:docker:serve
