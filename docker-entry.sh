#!/bin/sh

host="$1"
port="$2"

until $(nc -z $host $port); do
	echo "waiting for $host on $port..."
  sleep 2
done

echo "db migrate"
sequelize db:migrate
echo "db seed"
sequelize db:seed:all
echo "pm2 start"
pm2-runtime start process.yml