var router = require('./../componentes/router');

exports.executar = obj => {
    var obj_ = obj;
    with(router) with(obj){
        let dados = data;
        console.log('OBJ: ',dados);
        if(!(dadosconec = acesso_valido(dados.token,responder))) return;

        let escola = dadosconec.escoladata;

        (async ()=>{
            with(obj_){
                try{

                    console.log('DADOS: ',dados);

                    var aluno = database.selectid('alunos','alunoconectado',dados.token, false);
                    if(!aluno){
                        responder({
                            erro:'Falha na consutla',
                            alerta:'Falha na consutla',
                        });
                        return;
                    }

                    var alunodata = aluno.alunodata;
                    var escoladata = aluno.escoladata;

                    var tab = `chat_tur_alu_${escoladata.id}_${alunodata.AnoBase}_${alunodata.tCodigo}`;

                    database.insert('alunos', tab, {
                        texto:dados.conversa,
                        aluno:{
                            Codigo:alunodata.aCodigo,
                            Nome:alunodata.Nome
                        }
                    });

                    var ret = [];

                    var conv = database.ordenar((a,b)=>{
                        return (new Date(a.)) > (new Date());
                    }).select('alunos', tab, false, l => {
                        return l.texto;
                    });

                    responder({
                        setGlobal:{
                            conversaTurma:conv
                        }
                    });

                    //conversaTurma

                    /*responder({
                        janelaAtiva:'chatturma'
                    });*/
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