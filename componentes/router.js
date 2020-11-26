

exports.get_mysql_conexao = require('./mysql').get_mysql_conexao;
exports.mysql_atendimento = require('./mysql').mysql_atendimento;

exports.NoSqlDigital = require('./bdnosql').NoSqlDigital;
exports.socketback = require('./socketserver').socketback;

exports.database = exports.NoSqlDigital();

//retorna a conexão pelo token
exports.conectado = token => {
    var dadosconec = exports.database.selectid('alunos','alunoconectado',token);
    return dadosconec.conectado ? dadosconec : false;
}

//ver se a pessoa esta logado, caso sim retorna os dados de conectado
exports.acesso_valido = (token,responder) => {
    var r;
    if(r = exports.conectado(token)){
        return r;
    }else{
        responder({
            janelaAtiva:'pedir_acesso',
            erro:'Acesso inválido, aluno deslogado'
        })
        return false;
    }
}

// **************************************************************

//tokens conectados
exports.tokensativos = {};

//turmas com pessoas conectadas
exports.turmas = {};

//adiciona um token a lista de analizes exports.tokensativos, exports.turmas
exports.add_token = (dados,alunodados,client,responder) => {
    var alunodata = alunodados.alunodata;
    var escoladata = alunodados.escoladata;

    var reg = {
        aluno:alunodata.aCodigo,
        turma:alunodata.tCodigo,
        ano:alunodata.AnoBase,
        matricula:alunodata.mCodigo,
        token:dados.token,
        escola:escoladata.id,
        client:client,
        responder:responder
    }

    exports.tokensativos[dados.token] = reg;
    exports.turmas[`${reg.escola}_${reg.ano}_${reg.turma}`] = reg;
}

//remove token das listas exports.tokensativos, exports.turmas
exports.remover_token = token => {
    delete exports.tokensativos[token];
    for(var i in exports.turmas){
        if(exports.turmas[i].token == token) delete exports.turmas[i];
    }
}


socketback.conectar()