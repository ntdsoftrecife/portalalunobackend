var router = require('./../componentes/router');

exports.executar = obj => {
    with(router) with(obj){
        var dados = data;
        var st = dados.site.replace(/(http\(s\):\/\/|www\.|\.br)/g,'').replace(/[^a-zA-Z0-9\-\_\.]/g,'.');
        var cons = `select id, id_escola, escola, site_1, banco, user_bd, porta_bd, pass_bd, host_bd, block, online
            from clientes
            where site_1 regexp ${mysql_atendimento.escape(`.*${st}.*`)}`;
        mysql_atendimento.query(
            cons,
            (err,resul)=>{
                if(err){
                    console.error(err);
                    responder({
                        erro:'Falha ao tentar consultar seu site',
                        alerta:'Falha ao tentar consultar seu site'
                    })
                }else{
                    if(resul.length > 0 ){
                        database.insert('alunos', 'alunoconectado', {
                            _id:dados.token,
                            idclient:obj.client.id,
                            conectado:0,
                            escoladata:resul[0]
                        });
                        responder({
                            janelaAtiva:'pedir_login',
                            log:'Site encontrado com sucesso',
                            localStorage:{site:resul[0].site_1}
                        })
                    }else{
                        responder({
                            erro:'Acesso negado, site não encontrado',
                            alerta:'Acesso negado, site não encontrado'
                        })
                    }
                }
            }
        )
    }
    

}

