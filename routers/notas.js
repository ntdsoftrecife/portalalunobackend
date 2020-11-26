const express = require('express');
const router = express.Router();
const fs = require('fs');
const axios = require('axios')


router.get('/vernotas',async (req,res) => {
    const matricula = req.matricula;
    const notas = await req.connectionAluno.Table(`select d.Disciplina,
            n.N1, n.N2, n.N3, n.N4, n.N5, n.N6, n.N7, n.N8, n.N9,
            n.F1, n.F2, n.F3, n.F4, n.F5, n.F6, n.F7, n.F8, n.F9,
            n.RecupFinal, n.MediaParcial, n.MediaFinal, n.FaltasTotal, n.Resultado, n.MA,
            n.Codigo nCodigo, d.Codigo dCodigo, n.MatriculaCod mCodigo,
            n.ocultar_registro
        from TblNotas n
            join TblDisciplina d on (not d.Excluir) and d.Codigo=n.DisciplinaCodigo
        where (not n.Excluir) and n.MatriculaCod=${req.escape(matricula.mCodigo)}`);
    res.json(notas || {erro:'Nenhum registro de notas encontrado'});
})


router.get('/printnotas', async (req,res) => {
    const matricula = req.matricula;
    const escola = req.escola;
    var r = await axios.get(`https://ntdsoft.net.br/ntd_prints/?token=rWNfmihTQ8B52awVjRm6GHbOQ9l1LGsU17BoTFfWXTaYaSwWgh`+
        `&cli=${escola.id}&dc=boletim_global&fixar&modo=json&mat=${matricula.mCodigo}&print`);
    res.json({
        url:'https://ntdsoft.net.br/ntd_prints/?tk='+r.data.token
    })
})

router.get('/printnotasinfantil', async (req,res) => {
    const matricula = req.matricula;
    const escola = req.escola;
    var r = await axios.get(`https://ntdsoft.net.br/ntd_prints/?token=rWNfmihTQ8B52awVjRm6GHbOQ9l1LGsU17BoTFfWXTaYaSwWgh`+
        `&cli=${escola.id}&dc=boletim_global_infantil&fixar&modo=json&mat=${matricula.mCodigo}&print`);
    res.json({
        url:'https://ntdsoft.net.br/ntd_prints/?tk='+r.data.token
    })
})


module.exports = router;