var router = require('./../componentes/router');

exports.executar = obj => {
    var obj_ = obj;
    with(router) with(obj){
        var dados = data;
        if(!(dadosconec = acesso_valido(dados.token,responder))) return;

        let escola = dadosconec.escoladata;

        (async ()=>{
            with(obj_){

                var conectaluno = await get_mysql_conexao(escola.host_bd, escola.user_bd, escola.pass_bd, escola.banco);

                const cons = `select concat_ws(' - ',concat_ws(' ',t.Turma,t.Turma_Tipo), t.Turno) turma,
                        concat_ws(' - ',m.AnoBase, t.Curso_Grau, concat_ws(' ','Mat.:',m.Codigo)) detalhe,
                        m.Codigo
                    from TblMatricula m
                        join TblTurma t on (not t.Excluir) and t.Codigo=m.TurmaCodigo
                    where (not m.Excluir) and m.AlunoCodigo=${mysql_atendimento.escape(dadosconec.alunodata.aCodigo)}
                    order by m.AnoBase desc, turma`;

                conectaluno.query(cons,(err,resul) => {
                    if(err){
                        console.error(err);
                        responder({
                            erro:'Falha na consutla',
                            alerta:'Falha na consutla',
                        });
                    }else{
                        responder({
                            janelaAtiva:'minhas_matriculas',
                            setGlobal:{listaMatriculas:resul}
                        });
                    }
                });
            
            }
        })()
    }
    
}

