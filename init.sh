#!/bin/bash

read -p 'There is .env file in bot?(y/n) : ' status
if [[ "$status" = "n" ]]; then
  read -p "Telegram Token:" token
  read -p "MongoDbUri:" mongodburi
  echo "MongoDbUri='$mongodburi'" > .env
  echo "TelegramToken='$token'" >> .env
fi
npm install
npm start
