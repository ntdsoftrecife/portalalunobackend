var router = require('./../componentes/router');

exports.executar = obj => {
    var obj_ = obj;
    with(router) with(obj){
        let dados = data;
        if(!(dadosconec = acesso_valido(dados.token,responder))) return;

        let escola = dadosconec.escoladata;

        (async ()=>{
            with(obj_){
                try{

                    var aluno = database.selectid('alunos','alunoconectado',dados.token, false);

                    //carregar ultimas conversas para o aluno

                    responder({
                        janelaAtiva:'chatturma'
                    });
                }catch(e){
                    console.error(e);
                    responder({
                        erro:'Falha na consutla',
                        alerta:'Falha na consutla',
                    });
                }
            
            }
        })()
    }
    
}