var fs = require('fs');
var router = require('./../componentes/router');

exports.executar = obj => {
    let obj_ = obj;
    with(router) with(obj_){
        let dados = data;

        let dadosconec = database.selectid('alunos', 'alunoconectado', dados.token);

        if(dadosconec.length <= 0){
            responder({
                janelaAtiva:'pedir_acesso',
                erro:'Tentativa de acesso inválido',
                alerta:'Tentativa de acesso inválido'
            })
            return;
        }

        const escola = dadosconec.escoladata;

        (async () => {
            with(obj_){
                try{

                    var conectaluno = await get_mysql_conexao(escola.host_bd, escola.user_bd, escola.pass_bd, escola.banco);

                    const conslog = `select matricula, nivel
                        from logins_alunos
                        where login=${conectaluno.escape(dados.log)} and senha=password(${conectaluno.escape(dados.pass)})
                            and (not Excluir) and (not aluno_block)`;

                    try{
                        var log = await conectaluno.consulta(conslog).linha();
                        if(!log) throw 'Acesso negado, login ou senha inválida ou este login esta bloqueado';

                        const consaluno = `select a.Codigo aCodigo, a.Nome Aluno, a.Pai, a.Mae, a.Responsavel, a.DataNasc,
                                m.Codigo mCodigo, m.AnoBase,
                                t.Codigo tCodigo, t.Turma, t.Turma_Tipo, t.Turno, t.Curso_Grau,
                                ai.Foto
                            from TblAluno a
                                join TblMatricula m on (not m.Excluir) and (m.Codigo=${conectaluno.escape(log.matricula)}) and a.Codigo=m.AlunoCodigo and m.AnoBase >= year(now())-1
                                join TblTurma t on (not t.Excluir or t.Excluir is null) and t.Codigo=m.TurmaCodigo
                                left join TblAlunoImg ai on (not ai.Excluir) and ai.IdImgAluno=a.Codigo
                            where (not a.Excluir) and (not a.Status_Inativo or a.Status_Inativo is null)
                            order by if(m.AnoBase=year(now()),0,1), m.AnoBase desc
                            limit 1`;

                        var aluno = await conectaluno.consulta(consaluno).linha();
                        if(!aluno) throw 'Acesso negado, login ou senha inválida ou este login esta bloqueado!';

                        const consnota = `select avg(replace(n.MediaParcial,',','.')) MediaParcial,
                                avg(replace(n.MediaFinal,',','.')) MediaFinal,
                                r.Situacao
                            from TblNotas n
                                left join TblResultado r on (not r.Excluir) and r.Ano=${conectaluno.escape(aluno.AnoBase)} and
                                    r.CodTurma=${conectaluno.escape(aluno.tCodigo)} and
                                    r.CodAluno=${conectaluno.escape(aluno.mCodigo)}
                            where (not n.Excluir) and n.MatriculaCod=${conectaluno.escape(aluno.mCodigo)}`;

                        var nota = await conectaluno.consulta(consnota).linha();
                        aluno.mediaParcial = nota.MediaParcial;
                        aluno.mediaFinal = nota.MediaFinal;

                        var ft = aluno.Foto;
                        fs.writeFileSync('./tmp.jpg',ft);
                        var foto = (new Buffer(fs.readFileSync('./tmp.jpg'))).toString('base64');
                        aluno.Foto = foto;

                        var dt = {
                            alunodata:aluno,
                            conectado:1
                        }
                        database.updateid('alunos', 'alunoconectado', dt, dados.token);

                        responder({
                            log:`Bem vindo(a) "${aluno.Aluno}"`,
                            janelaAtiva:'inicio',
                            setGlobal:dt
                        })
                        
                    }catch(e){
                        console.log('ERRO: ',e);
                        responder({
                            janelaAtiva:'pedir_login',
                            erro:e,
                            alerta:e
                        })
                    }

                }catch(e){
                    console.error('ERRO: ',e);
                    responder({
                        janelaAtiva:'pedir_login',
                        erro:`Falha na conexão com o banco de dados da escola "${escola.site_1}"`,
                        alerta:'Falha na conexão com o banco de dados'
                    })
                }
            }
        })();

    }
    

}

