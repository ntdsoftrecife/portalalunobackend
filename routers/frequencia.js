const express = require('express');
const router = express.Router();


router.get('/listmatric',async (req,res) => {
    const {mCodigo} = req.matricula;
    const r = await req.connectionAluno.Query(`select date_format(f.datahora,'%d/%m/%Y %H:%i:%s') data,
            f.entrada,
            m.AnoBase,
            t.Turma, t.Turma_Tipo, t.Turno, t.Curso_Grau
        from tblfreqgeral f
            join TblMatricula m on (not m.Excluir) and ( m.Codigo=f.MatriculaCod or m.AlunoCodigo=f.reg ) and m.Codigo=${req.escape(mCodigo)}
            left join TblTurma t on (not t.Excluir) and t.Codigo=m.TurmaCodigo
        where (not f.Excluir or f.Excluir is null) and f.tipo='a'
        order by f.datahora desc
        limit 1000`)
    res.json(r || []);
});
/*
union
select date_format(concat(date(f.Data),' ',f.Hora),'%d/%m/%Y %H:%i:%s') data,

from TblFrequencia_Aluno f
    join TblMatricula m on (not m.Excluir) and 
        (
            (m.Codigo<>0 and m.Codigo=f.Cod_Matricula and (m.Codigo=:mCodigo or m.Codigo is null)) or
            (m.Codigo=0 and f.Cod_Aluno=m.AlunoCodigo and f.Cod_Turma=m.TurmaCodigo and f.Ano_Letivo=m.AnoBase)
        )
    left join TblTurma t on (not t.Excluir) and t.Codigo=m.TurmaCodigo
where (not f.Excluir or f.Excluir is null)*/


module.exports = router;