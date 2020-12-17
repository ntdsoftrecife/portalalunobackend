const express = require('express')
const router = express.Router();

/*

    URL: /backaluno/agendainfantil/

    Tabela:
create table if not exists agendainfantil(
        id int primary key auto_increment,
        matricula int not null,
        data datetime not null,
        dados text,
        Excluir bool default 0,
        Atualizar bool default 1,
        unique key norepeat (matricula, data)
    )

    
    Extrutura inicial dos "dados" JSON

    {
        lanche:{
            manha:{ descricao, hora },
            tarde:{ descricao, hora }
        },
        almoco:{ descricao, hora },
        jantar:{ descricao, hora },
        evacuacao:{descricao, tipo, hora},
        banho:[ {descricao, hora}, ... ],
        fralda:[ {descricao, hora}, ... ],
        sono:{
            manha:{descricao, inicio, fim},
            tarde:{descricao, inicio, fim},
            noite:{descricao, inicio, fim}
        },
        febre:{descricao, inicio, fim},
        vomito:{descricao, inicio, fim},
        dor:{descricao, inicio, fim},
        calmo,
        agitado,
        alegre,
        triste,
        descricao,
        observacao
    }

*/

//listar agenda infantil de uma matrícula específica - backaluno/agendainfantil/list
router.get('/list/:data?',async (req,res) => {
		const {matricula} = req;
    const r = await req.mysqlEscola.Query(`select id, matricula, date_format(data,'%d/%m/%Y %H:%m:%s') data, dados
        from agendainfantil
        where matricula=? and (not Excluir)
        order by data desc
        limit 10`,[matricula.mCodigo]);
		res.json(
				(r || []).map( d => {
						d.dados = JSON.parse(d.dados);
						return d;
				} )
		)
})

/*
router.post('/insert',(req,res) => {
    var data = req.body;
    const r = await req.mysqlEscola.Query(`insert into agendainfantil
        (id, matricula, data, dados) values
        (${req.escape(data.id || '')}, ${req.escape(req.matricula.mCodigo)}, now(), ${req.escape(JSON.stringify(dt))})`)

})*/

//teste de inserção
/*router.get('/inserttest',async (req,res) => {
    const d = (new Date()).toLocaleString().replace(/([\d]{4})[\/\-]([\d]{2})[\/\-]([\d]{2})/,'$3/$2/$1');
    const dt = {
        lanche:{
            manha:{ descricao:'bolacha', hora:d },
            tarde:{ descricao:'biscoito', hora:d }
        },
        almoco:{ descricao:'padrão', hora:d },
        jantar:{ descricao:'Sanduiche', hora:d },
        evacuacao:{descricao:'', tipo:'cocô', hora:d},
        banho:[ {descricao:'Mornô', hora:d} ],
        fralda:[ {descricao:'pampers', hora:d} ],
        sono:{
            manha:{descricao:'', inicio:'', fim:''},
            tarde:{descricao:'', inicio:d, fim:''},
            noite:{descricao:'', inicio:'', fim:''}
        },
        febre:{descricao:'', inicio:'', fim:''},
        vomito:{descricao:'', inicio:'', fim:''},
        dor:{descricao:'', inicio:'', fim:''},
        calmo:1,
        agitado:0,
        alegre:1,
        triste:0,
        descricao:'Nada a declarar',
        observacao:''
    };
    const r = await req.mysqlEscola.Query(`insert into agendainfantil
            (matricula, data, dados) values
            (${req.escape(req.matricula.mCodigo)}, now(), ${req.escape(JSON.stringify(dt))})
            on duplicate key update
            dados=${req.escape(JSON.stringify(dt))}`);
    res.json(r || {erro:'Falha na consulta'});
})*/


module.exports = router;
