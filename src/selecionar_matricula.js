var router = require('./../componentes/router');

exports.executar = obj => {
    var obj_ = obj;
    with(router) with(obj){
        let dados = data;
        if(!(dadosconec = acesso_valido(dados.token,responder))) return;

        let escola = dadosconec.escoladata;

        (async ()=>{
            with(obj_){

                var conectaluno = await get_mysql_conexao(escola.host_bd, escola.user_bd, escola.pass_bd, escola.banco);

                const cons = `select m.Codigo mCodigo, m.AnoBase,
                        t.Codigo tCodigo, t.Turma, t.Turma_Tipo, t.Turno, t.Curso_Grau,
                        avg(replace(n.MediaParcial,',','.')) MediaParcial,
                        avg(replace(n.MediaFinal,',','.')) MediaFinal,
                        r.Situacao
                    from TblMatricula m
                        join TblTurma t on (not t.Excluir) and t.Codigo=m.TurmaCodigo
                        join TblNotas n on (not n.Excluir) and n.MatriculaCod=m.Codigo
                        left join TblResultado r on (not r.Excluir) and r.Ano=m.AnoBase and
                            r.CodTurma=m.TurmaCodigo and r.CodAluno=m.AlunoCodigo
                    where (not m.Excluir) and m.Codigo=${conectaluno.escape(dados.mat)}
                    order by m.AnoBase desc, turma`;

                console.log('CONS: ',cons);

                try{
                    var resul = await conectaluno.consulta(cons).linha();
                    database.updateid('alunos','alunoconectado',
                    {
                        alunodata:{
                            mCodigo:resul.mCodigo,
                            AnoBase:resul.AnoBase,
                            tCodigo:resul.tCodigo,
                            Turma:resul.Turma,
                            Turma_Tipo:resul.Turma_Tipo,
                            Turno:resul.Turno,
                            Curso_Grau:resul.Curso_Grau,
                            mediaParcial:resul.MediaParcial || '-',
                            mediaFinal:resul.MediaFinal || '-',
                            resultado:resul.Situacao || '-'
                        }
                    },
                    dados.token)

                    var data = database.selectid('alunos','alunoconectado',dados.token, false);

                    responder({
                        janelaAtiva:'inicio',
                        setGlobal:{
                            turma:`${data.alunodata.Turma} ${data.alunodata.Turma_Tipo} - ${data.alunodata.Curso_Grau}`,
                            anoBase:data.alunodata.AnoBase,
                            mediaParcial:data.alunodata.mediaParcial || '-',
                            mediaFinal:data.alunodata.mediaFinal || '-',
                            resultado:data.alunodata.Situacao || '-'
                        }
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

