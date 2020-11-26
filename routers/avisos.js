const router = require('express').Router()
const mysql = require('mysql')


const INTERVALO = 1000 * 60 * 20; //20 min
const LIMIT_REGISTERS = 3000;


var dadosAvisos = [];
var dadosEscola = {};


const conexao = () => new Promise((res) => {
    console.log('conexao de avisos criada')
    const conex = mysql.createConnection({
        host:'localhost',
        user:'digital',
        password:'ykk578on',
        port:3306,
        database:'clientes'
    })
    console.log('conexão de avisos iniciada')
    conex.connect((err) => {
        if(err) return console.error('Falha na conexão com os avisos:',err) && res(null)
        console.log('conexão de avisos estabelecida')
        res(conex)
    })
})

const loadAvisos = async () => {
    console.log('Atualizando avisos')
    const connect = await conexao()
    if(!connect) return conesole.log('Conexão de avisos foi retornado null');
    console.log('Realizando consulta de avisos para atualização')
    connect.query(`select id,escolaid,data,aviso,date
        from clientes.avisos
        order by id desc
        limit ?`,[
            LIMIT_REGISTERS
        ],(err,result) => {
            if(err) return console.error('Erro na consulta dos avisos:',err)
            dadosAvisos = result;
            dadosEscola = {};
            dadosAvisos.map( line => {
                if(!dadosEscola[line.escolaid]) dadosEscola[line.escolaid] = []
                dadosEscola[line.escolaid].push(line);
            } )
            console.log('Avisos atualizado')
        })
}

setInterval(() => {
    loadAvisos()
},INTERVALO)

loadAvisos();

const filtroAluno = ({ultimoid,escola,tCodigo,AnoBase}) => {
    const regEscola = dadosEscola[escola.id];
    if(!regEscola) return [];
    return regEscola.filter( reg => {
        //trazer só o que referir a escola
        const {id} = reg;
        if(id <= Number(ultimoid)) return false;
        //trazer só o que se referir ao aluno
        const { data } = reg;
        var {turma,ano} = JSON.parse(data || '{}');
        turma = Number(turma || 0);
        ano = Number(ano || 0);
        if(ano)
            if(ano != AnoBase) return false;
        if(turma)
            if(turma != tCodigo) return false;
        return true;
    } )
}


// /backaluno/avisos/qtdaviso/:ultimoid
router.get('/qtdaviso/:ultimoid', (req,res) => {
    const {matricula,escola} = req;
    const {ultimoid} = req.params;
    const {tCodigo,AnoBase} = matricula;
    res.json({
        qtd: filtroAluno({ultimoid,escola,tCodigo,AnoBase}).length
    })
})


// /backaluno/avisos/listaavisos
router.get('/listaavisos', (req,res) => {
    const {matricula,escola} = req;
    const {ultimoid} = req.params;
    const {tCodigo,AnoBase} = matricula;
    res.json( filtroAluno({ultimoid,escola,tCodigo,AnoBase}) )
})


// /backaluno/avisos/allavisos
router.get('/allavisos', (req,res) => {
    res.json(dadosEscola)
})


module.exports = router;