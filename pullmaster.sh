git checkout master
git pull origin master

docker build --tag ntdalunoprivatebackend:2.0 .
docker run --publish 8013:8013 --detach --name napb ntdalunoprivatebackend:2.0