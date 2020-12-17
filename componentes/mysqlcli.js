/*

    Dependências:

        npm install mysql

*/

const {HOST, USER, SENHA, BANCO} = require('./configbd');
const mysql = require('mysql');
const express = require('express')
const fs = require('fs');


const mysql_erro =  tex => {
		console.log('MYSQL ERRO ALUNO: ',tex)
		tex = `${(new Date()).toString()}\n${tex}\n\n`;
		fs.appendFile('/digital/aluno12/mysql_erro.inf',tex,err =>{ if(err) console.error(err) })
}

// ************************** mysql_atendimento ***************************

const mysql_atendimento = mysql.createConnection({
    host:HOST,
    user:USER,
    password:SENHA,
    database:BANCO,
    timezone:'UTC'
    //charset:'utf8mb4_general_ci'
});

mysql_atendimento.connect(err=>{
    if(err){
        mysql_erro('Falha na conexão com o servidor - '+err)
        return;
        //throw err;
    }
    console.log('MYSQL ATENDIMENTO CONECTADO');
})

mysql_atendimento.Query = (query,data) => new Promise((res,rej) => {
    mysql_atendimento.query(query,data || [],(err, resu) => {
        if(err){
            mysql_erro('Erro de consulta - '+err)
            return res(null);
        }
        res(resu);
    });
});

mysql_atendimento.Table = async (query,data) => {
    try{
        const r = await mysql_atendimento.Query(query,data);
        return r || [] ;
    }catch(e){
        mysql_erro(e);
        return null;
    }
}

mysql_atendimento.Line = async (query,data) => {
    try{
        const r = await mysql_atendimento.Query(query,data);
        return r.length > 0 ? ( r[0] || null ) : null ;
    }catch(e){
        mysql_erro(e);
        return null;
    }
}


// ************************** mysql_escola ***************************

const mysql_escola = idEscola => new Promise(async (res,rej) => {
    try{
        const r1 = await mysql_atendimento.Line(`select *
            from clientes
            where id=${mysql.escape(idEscola)}`);
        if(!r1) return rej(`Escola "${idEscola}" não encontrado`)
        let m = mysql.createConnection({
            host:r1.host_bd,
            user:r1.user_bd,
            password:r1.pass_bd,
            database:r1.banco,
            timezone:'UTC'
        });
        m.datalogin = r1;
        
        m.connect(err => {
            if(err){
                mysql_erro(err)
                return res(null);
            }
            res(m);
        });

        m.Query = (query,data) => new Promise((res,rej) => {
            m.query(query,data || [],(err, resu) => {
                if(err){
                    mysql_erro(err)
                    return res(null);
                }
                res(resu);
            });
        });
        
        m.Table = async (query,data) => {
            try{
                const r = await m.Query(query,data);
                return r || [] ;
            }catch(e){
                mysql_erro(e);
                return null;
            }
        }
        
        m.Line = async (query,data) => {
            try{
                const r = await m.Query(query,data);
                return r.length > 0 ? ( r[0] || null ) : null ;
            }catch(e){
                mysql_erro(e);
                return null;
            }
        }
    }catch(e){
				mysql_erro(e);
        res(null);
    }
});

var mysqlRouter = express.Router();
mysqlRouter.all(/.*/,async (req,res) => {
	try{
    req.mysqlAtendimento = mysql_atendimento;
    if(req.escola)
        if(req.escola.id){
            req.mysqlEscola = await mysql_escola(req.escola.id)
            req.connectionAluno = req.mysqlEscola;
						if(!req.connectionAluno) return res.json({erro:'Erro na conexão com o banco de dados da escola'})
        }
    req.escape = mysql.escape;
	}catch(e){
		console.error(e);
		return res.json({erro:'Erro ligado ao SQL'});
	}
  req.next();
});

exports.mysql_atendimento = mysql_atendimento;
exports.mysql_escola = mysql_escola;
exports.mysqlRouter = mysqlRouter;
