git checkout dev
git pull origin dev

docker build --tag ntdalunoprivatebackend:dev .
docker run --publish 38013:8013 --detach --name napbdev ntdalunoprivatebackend:dev