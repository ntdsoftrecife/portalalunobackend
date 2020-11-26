/*
Dependências:
    npm install -g socket.io
    yarn add socket.io
    yarn add express
*/

//criar o server
const server = require('http').createServer();

//criar o io
const io = require('socket.io')(server);
//const io = require('../lib/socket.io')(server);

exports.socketback = () => {

    let ret = {};

    let onreceber = function(e){};
    let onconnection = function(e){};
    let ondisconnect = function(e){};

    

    //grupo de clientes e clientes
    let grupoclientes = {
        livre:{}
    }

    //quando o cliente se conectar
    io.on('connection', client_ => {

        let client = client_;

        //pegar de que grupo o cliente pertence
        let grupo = client.handshake.query.grupo ? client.handshake.query.grupo : 'livre' ;

        let query = client.handshake.query;

        let id = client.id;

        //criar o grupo se inexistente
        if(grupoclientes[grupo] === undefined) grupoclientes[grupo] = {};

        //inserir o cliente no grupo de clientes
        grupoclientes[grupo][id] = {
            id:id,
            client:client,
            dados:client.handshake.query
        };

        onconnection({
            client:client,
            grupo:grupo,
            id:id,
            query:client.handshake.query,
            responder:data => client.emit('message',JSON.stringify(data))
        });

        //receber do cliente
        client.on('message', data_ => {
            try{
                var js = JSON.parse(data_);
            }catch(e){
                var js = {msg:data_};
            }
            onreceber({
                    data:js,
                    grupo:grupo,
                    client:client,
                    clientdata:grupoclientes[grupo][id],
                    responder:data => { client.emit('message',JSON.stringify(data)); }
                });
        });

        //quando o cliente se desconectar
        client.on('disconnect', () => {
            ondisconnect({
                client:client,
                grupo:grupo,
                id:id,
                query:query
            });
        });
        
    });

    //conectar
    ret.conectar = porta => {
        console.log('Socket conectado na porta '+porta)
        server.listen(porta);
        return ret;
    }

    //enviar dados para todo mundo
    ret.enviardados = data => {
        if(!(typeof data == 'object')) throw "A informação a ser enviada deve ser uma extrutura";
        for(var i in grupoclientes){
            clientes = grupoclientes[i];
            for(var n in clientes){
                clientes[n].client.emit('message',JSON.stringify(data));
            }
        }
        return ret;
    }

    //enviar dados para um grupo
    ret.enviardadosgrupo = (grupo, data) => {
        if(!(typeof data == 'object')) throw "A informação a ser enviada deve ser uma extrutura";
        if(grupoclientes[grupo]){
            clientes = grupoclientes[grupo];
            for(var n in clientes){
                clientes[i].client.emit('message',JSON.stringify(data));
            }
        }else{
            console.log('Grupo não encontrado. Dados: ',data);
        }
        return ret;
    }

    //enviar dados para um cliente
    ret.enviardadoscliente = (grupo, cliente, data) => {
        if(!(typeof data == 'object')) throw "A informação a ser enviada deve ser uma extrutura";
        if(grupoclientes[grupo]){
            clientes = grupoclientes[grupo];
            if(clientes[cliente]){
                clientes[cliente].client.emit('message',JSON.stringify(data));
            }else{
                console.log('Cliente não encontrado. Dados: ',data);
            }
        }else{
            console.log('Grupo não encontrado. Dados: ',data);
        }
        return ret;
    }

    ret.onreceber = f=>{ onreceber = f; return ret; }
    ret.onconnection = f=>{ onconnection = f; return ret; }
    ret.ondisconnect = f=>{ ondisconnect = f; return ret; }

    ret.grupos = () => grupoclientes;
    ret.clientes = grupo => grupoclientes[grupo || 'livre'];

    return ret;

}

/*

funções: conectar(porta),
            enviardados(data),
            enviardadosgrupo(grupo,data),
            enviardadoscliente(grupo,cliente,data)
            grupos()
            clientes(grupo)

eventos: onreceber(func({data,grupo,client,clientdata,responder})),
          onconnection(func({client,grupo,id,query,responder})),
          ondisconnect(func(client,grupo,id,query))

*/