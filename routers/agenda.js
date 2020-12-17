const express = require('express');
const router = express.Router();
const fs = require('fs');
const utf8 = require('utf8')


router.get('/list', async (req,res) => {
    const matricula = req.matricula;
    var r = await req.connectionAluno.Table(`select id, date_format(datahora,'%Y-%m-%d') datahora, titulo, texto
        from agenda_escolar
        where (not Excluir) and turma in (${matricula.tCodigo},0,null) and (year(datahora) >= year(now()) OR year(datahora) <= 1990)
        order by
            if(
                date(datahora) = date(now()),
                0,
                if(
                    date(datahora) > date(now()),
                    1,
                    2
                )
            ), datahora desc`);
/*				r = r.map( r => {
        try{
            r.titulo = utf8.decode(r.titulo);
            r.texto = utf8.decode(r.texto);
        }catch(e){
            console.log('Erro de utfdecode ',e)
        }
        return r;
    } )*/
    res.json(r);
})



module.exports = router;
