const express = require('express');
const mysql = require('mysql')
//const {mysql_atendimento, mysql_escola} = require('./../componentes/mysqlcli');
//const {token, getToken, parseCookie} = require('./../componentes/token')

const router = express.Router();


//auto logar aluno
router.all('/autolog/:site?/:log?/:pass?', async (req,res) => {
    var {site, log, pass} = req.params;
    if(site){
        site = site.replace(/(https?|:|\/)/g,'');
        try{
            var r = await req.mysqlAtendimento.Line(`select *
                from clientes
                where site_1 like ${mysql.escape(`%${site}%`)} and (not block)`);
        }catch(e){
            console.error(e);
        }
        if(r){
            await req.setTokenData({escola:r});
        }
    }
    //res.send('Processo feito')
    res.redirect('/aluno/')
})

//setsite
router.post('/setsite',async (req,res) => {
    var site = req.body.site || '';
    if(!site)
        return res.json({
            erro:'Nenhum site informado'
        })
    var site = site.replace(/(https?|:|\/)/g,'');
    try{
        var r = await req.mysqlAtendimento.Line(`select *
            from clientes
            where site_1 like ${mysql.escape(`%${site}%`)} and (not block)`);
    }catch(e){
        console.error(e);
        return res.json({
            erro:'Erro de consulta'
        });
    }
    if(r){
        await req.setTokenData({escola:r});
        res.json({
            return:1,
            data:{
                id:r.id,
                idEscola:r.id_escola,
                escola:r.escola,
                site:r.site_1
            }
        });
    }else{
        res.json({
            erro:'Site "'+site+'" não encontrado'
        });
				console.error('Tentativa de acesso com o site: ',site);
    }
})

//continua apenas se o site estiver definido
router.all(/\/.*/,async (req,res) => {
    if(!req.escola) return res.json({
        erro:'Site não definido',
        alerta:'Site não definido',
        janelaAtiva:'pedir_site',
        cod:'af1ew8542y3ty27t9'
    })
    if(!req.escola.site_1) return res.json({
        erro:'Site não definido',
        alerta:'Site não definido',
        janelaAtiva:'pedir_site',
        cod:'af1ew8542y3ty27t9'
    })
		var r = await req.mysqlAtendimento.Line(`select *
            from clientes			
            where site_1 like ? and (not block)`,req.escola.site_1);
		if(!r) return res.json({erro:'Site não encontrado'})
		if(r.length == 0) return res.json({erro:'Site não encontrado'})
    req.next()
})

//setstudent
router.post('/setstudent',async (req,res) => {
    var log = (req.body && req.body.log) || (req.query && req.query.log) || '';
    var pass = (req.body && req.body.pass) || (req.query && req.query.pass) || '';
    data = await req.getTokenData();
    try{
        const connectaluno = req.mysqlEscola;
        if(connectaluno){
            //req.connectionAluno = connectaluno;
            try{
                var errodesc = 'Login e/ou senha inválida';
                const reglogin = await connectaluno.Line(`select *
                    from logins_alunos
                    where login like ${mysql.escape(log)} and senha = password(${mysql.escape(pass)}) and (not aluno_block)`);
                if(!reglogin) throw `Login "${log}" e senha "${pass}" não encontrados na tabela logins_alunos`;

                var errodesc = 'Matrícula "'+reglogin.matricula+'" ou turma referente senha não existe ou é inválida';
                const regmatricula = await connectaluno.Line(`select m.Codigo mCodigo, m.AnoBase, m.AlunoCodigo aCodigo,
                        t.Codigo tCodigo, t.Turma, t.Turma_Tipo, t.Turno, t.Curso_Grau, m.Codigo mCodigo
                    from TblMatricula m
                        join TblTurma t on (not t.Excluir) and t.Codigo=m.TurmaCodigo
                    where (not m.Excluir) and m.Codigo=${mysql.escape(reglogin.matricula)}
                    order by m.AnoBase desc
                    limit 1`);
                if(!regmatricula) throw `Matrícula "${reglogin.matricula}" não encontrada`;

                var errodesc = `Aluno "${regmatricula.aCodigo}" inexistente ou inativo`;
                const regaluno = await connectaluno.Line(`select *
                from TblAluno
                where (not Excluir) and (not Status_Inativo or Status_Inativo is null) and
                    Codigo=${mysql.escape(regmatricula.aCodigo)}`);
                if(!regaluno) throw errodesc;

                await req.setTokenData({aluno:regaluno, matricula:regmatricula, nivel:reglogin.nivel});
                req.aluno = regaluno;
                req.matricula = regmatricula;
                req.nivel = reglogin.nivel;
								const {id, escola, site_1} = req.escola;
                res.json({
                    alert:'Logado com sucesso',
                    return:1,
                    aluno:regaluno,
                    matricula:regmatricula,
                    nivel:reglogin.nivel,
										escola:{ id, escola, site_1 }
                });
            }catch(e){
                try{ console.error(req.escola.site_1,'-',e); }catch(e2){ console.error(e2) }
                return res.json({
                    erro:errodesc
                });
            }
        }else{
            return res.json({
                erro:'Falha na conexão com o servidor da escola'
            });
        }
    }catch(e){
        console.error(e);
        return res.json({
            erro:'Falha na conexão com o servidor da escola'
        });
    }
})

//continua se o login estiver definido
router.all(/\/(.*)/,async (req,res) => {
    const q = await req.getTokenData();
    if(!q) return res.json({
        erro:'Aluno não logado',
        alerta:'Aluno não logado',
        janelaAtiva:'pedir_login',
        cod:'y579u87gh23r9t7e',
        site:q.escola.site_1
    })
    if(!q.aluno) return res.json({
        erro:'Aluno não logado',
        alerta:'Aluno não logado',
        janelaAtiva:'pedir_login',
        cod:'y579u87gh23r9t7e',
        site:q.escola.site_1
    })
    if(!q.aluno.Codigo) return res.json({
        erro:'Aluno não logado',
        alerta:'Aluno não logado',
        janelaAtiva:'pedir_login',
        cod:'y579u87gh23r9t7e',
        site:q.escola.site_1
    })
    if(!q.matricula) return res.json({
        erro:'Aluno sem matrícula',
        alerta:'Aluno sem matrícula',
        janelaAtiva:'pedir_login',
        cod:'y579u87gh23r9t7e',
        site:q.escola.site_1
    })
    if(!q.matricula.mCodigo) return res.json({
        erro:'Aluno sem matrícula',
        alerta:'Aluno sem matrícula',
        janelaAtiva:'pedir_login',
        cod:'y579u87gh23r9t7e',
        site:q.escola.site_1
    })
    /*res.json({
        log:'Acesso negado - faça o login',
        alert:'Acesso negado - faça o login',
        janelaAtiva:'pedir_login'
    })*/
    req.aluno = q.aluno;
    req.matricula = q.matricula;
    req.nivel = q.nivel;
    //req.connectionAluno = await mysql_escola(req.escola.id);
    req.next();
})


//verify if student no block
router.use(async (req,res, next) => {
    const q = await req.getTokenData();
    const student = await req.mysqlEscola.Line(`select Codigo from TblAluno
            where Codigo=? and
                (not Excluir or Excluir is null) and
                (not Status_Inativo or Status_Inativo is null)`,
            q.matricula.aCodigo)
    if(!student) return res.json({erro:'Acesso negado, seu usuário pode está inativo ou excluído'})
    next()
})


router.all('/logado',(req,res) => {
		const {id, escola, site_1} = req.escola;
    res.json({
        return:1,
        aluno:req.aluno,
        matricula:req.matricula,
        nivel:req.nivel,
				escolaid:req.escola.id,
				escola:{id, escola, site_1}
    })
})

router.get('/logoff',(req,res) => {
    req.setTokenData({aluno:false, matricula:false});
    res.json({return:1});
})

router.get('/menusinativo',(req,res) => {
    res.json(
        req.nivel == 1 ?
        [] :
        [
            'filhos',
            'mensalidades'
        ]
    )
})

router.all('/alterlogin', async (req,res) => {
    var {logatual, passatual, newlog, newpass, confirpass} = req.body;
    const matricula = req.matricula.mCodigo;
    const matriculaesc = req.escape(matricula);
    if(logatual && passatual && newlog && newpass && confirpass){

        if(newpass != confirpass)
            return res.json({erro:'A nova senha está diferente da confirmação de senha'})

        if(newlog != newlog.replace(/[^a-zA-Z0-9\_\-]/g,''))
            return res.json({erro:'O login só aceita letras simples e números'})
            
        if(newpass != newpass.replace(/[^a-zA-Z0-9\_\-]/g,''))
            return res.json({erro:'A senha só aceita letras simples e números'})

        var r = await req.mysqlEscola.Line(`select id
                from logins_alunos
                where login=${req.escape(logatual)} and senha=password(${req.escape(passatual)}) and matricula=${matriculaesc}`);
        if(!r) return res.json({erro:'O login e senha atual informado não bate com sua matrícula "'+matricula+'"'})

        var r = await req.mysqlEscola.Line(`select id
                from logins_alunos
                where matricula<>${matriculaesc} and login=${req.escape(newlog)}`);
        if(r && r.length > 0) return res.json({erro:'Já existe um usuário com este login. Informe outro.'})
        
        const cons = `update logins_alunos
            set login=${req.escape(newlog)}, senha=password(${req.escape(newpass)})
            where matricula=${matriculaesc} and login=${req.escape(logatual)}`;
        var r = await req.mysqlEscola.Query(cons);
        if(!r || r.length == 0) return res.json({erro:'Não foi possível usar este login. Erro de geração.'})

        return res.json({return:'Senha alterada com sucesso.'});
    }
    res.json({erro:'dados informado incorretamente ou está faltando informações'})
});

router.all(/.*/,(req,res) => {
	try{
		console.log((new Date()).toString().replace(/GMT.*$/,''),'-',req.escola.site_1,req.aluno.Nome,'->',req.aluno.Codigo);
	}catch(e){ console.error(e) }
	req.next();
})

module.exports = router;

/*
+-------------+------------+------+-----+---------+----------------+
| Field       | Type       | Null | Key | Default | Extra          |
+-------------+------------+------+-----+---------+----------------+
| id          | int(11)    | NO   | PRI | NULL    | auto_increment |
| matricula   | int(11)    | YES  | MUL | 0       |                |
| login       | char(50)   | YES  | UNI |         |                |
| senha       | char(50)   | YES  |     |         |                |
| nivel       | int(11)    | YES  |     | 1       |                |
| senha_init  | char(50)   | YES  |     |         |                |
| aluno_block | tinyint(1) | YES  |     | 0       |                |
| Excluir     | tinyint(1) | YES  |     | 0       |                |
| Atualizar   | tinyint(1) | YES  |     | 1       |                |
+-------------+------------+------+-----+---------+----------------+

O que gera na requisição:

    req.escape(texto) // mesma coisa que mysql.escape(texto)
    req.escola //extrutura com dados da escola
    req.aluno //extrutura com dados do aluno
    req.matricula //extrutura com dados da escola
    req.connectionAluno //classe de conexão com o banco de dados da escola
        funções:
            Query(consulta):array
            Table(consulta):array //retorna null em caso de erro
            Line(consulta):structure //retorna null em caso de erro ou se não houver registro

*/
