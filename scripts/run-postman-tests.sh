#!/bin/bash

npm install -g newman

newman run postman/social-connect.postman_collection.json \
  -e postman/environments/dev.postman_environment.json