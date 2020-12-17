const express = require('express');
const router = express.Router();
const fs = require('fs');

//dados do aluno
router.get('/dados',(req, res) => {
    //console.log('DADOS: ',req.getTokenData())
    res.json({
        aluno:req.aluno,
        matricula:req.matricula
    })
})

//setar a matrícula do aluno
router.get('/setmatricula/:mat',async (req,res) => {
    const r = await req.connectionAluno.Line(`select m.Codigo mCodigo, m.AnoBase, m.AlunoCodigo aCodigo,
            t.Codigo tCodigo, t.Turma, t.Turma_Tipo, t.Turno, t.Curso_Grau, m.Codigo mCodigo
        from TblMatricula m
            join TblTurma t on (not t.Excluir) and t.Codigo=m.TurmaCodigo
        where (not m.Excluir) and m.Codigo=${req.escape(req.params.mat)} and m.AlunoCodigo=${req.escape(req.aluno.Codigo)}
        order by m.AnoBase desc
        limit 1`);
    req.setTokenData({matricula:r})
    res.json( r ?
        r :
        {
            erro:'Matrícula "'+req.params.mat+'" não encontrada para o aluno "'+req.aluno.Codigo+'"'
        }
    )
})

/*router.get('/setmatriculaativa/:mat',async (req,res) => {
    const r = await req.connectionAluno.Line(`select m.Codigo mCodigo, m.AnoBase, m.AlunoCodigo aCodigo,
            t.Codigo tCodigo, t.Turma, t.Turma_Tipo, t.Turno, t.Curso_Grau, m.Codigo mCodigo
        from TblMatricula m
            join TblTurma t on (not t.Excluir) and t.Codigo=m.TurmaCodigo
        where (not m.Excluir) and m.AlunoCodigo=${req.escape(alu)}
        order by m.AnoBase desc
        limit 1`);
    req.setTokenData({matricula:r})
    res.json( r ?
        r :
        {
            erro:'Matrícula "'+req.params.mat+'" não encontrada para o aluno "'+req.aluno.Codigo+'"',
            alerta:'Matrícula "'+req.params.mat+'" não encontrada para o aluno "'+req.aluno.Codigo+'"'
        }
    )
})*/

//dados da matrícula
router.get('/matricula',async (req, res) => {
    const r = await req.connectionAluno.Table(`select m.Codigo mCodigo, m.AnoBase,
            t.Turma, t.Turma_Tipo, t.Turno, t.Curso_Grau
        from TblMatricula m
            join TblTurma t on (not t.Excluir) and t.Codigo=m.TurmaCodigo
        where (not m.Excluir) and m.Codigo=${req.escape(req.matricula.mCodigo)}`)
    res.json(r || {erro:'Nenhum registro encontrado'})
})

//notas
router.get('/notas',async(req, res) => {
    const r = await req.connectionAluno.Table(`select n.ND1, n.ND2, n.ND3, n.ND4, n.ND5, n.ND6, n.ND7, n.ND8, n.ND9, n.ND10,
            n.ND11, n.ND12, n.ND13, n.ND14, n.ND15, n.ND16, n.ND17, n.ND18, n.ND19, n.ND20,
            n.ND21, n.ND22, n.ND23, n.ND24, n.ND25, n.ND26, n.ND27, n.ND28, n.ND29, n.ND30,
            n.ND31, n.ND32, n.ND33, n.ND34, n.ND35, n.ND36, n.ND37, n.ND38, n.ND39, n.ND40,
            n.ND41, n.ND42, n.ND43, n.ND44, n.ND45, n.ND46, n.ND47, n.ND48, n.ND49, n.ND50,
            n.ND51, n.ND52, n.ND53, n.ND54, n.ND55, n.ND56, n.ND57, n.ND58, n.ND59, n.ND60,
            n.N1, n.N2, n.N3, n.N4, n.N5, n.N6, n.N7, n.N8, n.N9,
            n.F1, n.F2, n.F3, n.F4, n.F5, n.F6, n.F7, n.F8, n.F9,
            n.MediaFinal, n.MediaParcial, n.Resultado,
            n.Codigo,
            m.AnoBase,
            d.Codigo dCodigo, d.Disciplina
        from TblNotas n
            join TblMatricula m on (not m.Excluir) and m.Codigo=n.MatriculaCod and m.Codigo=${req.escape(req.matricula.mCodigo)}
            join TblDisciplina d on (not d.Excluir) and d.Codigo=n.DisciplinaCodigo
            join TblTurmaDisciplina td on (not td.Excluir) and td.TurmaCodigo=m.TurmaCodigo and td.AnoBase in (0,m.AnoBase)
        where (not n.Excluir)
        order by td.Pos_Ordem, d.Disciplina`)
    res.json(r || {erro:'Nenhum registro encontrado'})
})

//médias
router.get('/medias',async (req, res) => {
    const r = await req.connectionAluno.Line(`select
            m.Codigo mCodigo,
            avg(replace(n.ND1,',','.')) ND1, avg(replace(n.ND2,',','.')) ND2, avg(replace(n.ND3,',','.')) ND3, avg(replace(n.ND4,',','.')) ND4, avg(replace(n.ND5,',','.')) ND5, avg(replace(n.ND6,',','.')) ND6, avg(replace(n.ND7,',','.')) ND7, avg(replace(n.ND8,',','.')) ND8, avg(replace(n.ND9,',','.')) ND9, avg(replace(n.ND10,',','.')) ND10,
            avg(replace(n.ND11,',','.')) ND11, avg(replace(n.ND12,',','.')) ND12, avg(replace(n.ND13,',','.')) ND13, avg(replace(n.ND14,',','.')) ND14, avg(replace(n.ND15,',','.')) ND15, avg(replace(n.ND16,',','.')) ND16, avg(replace(n.ND17,',','.')) ND17, avg(replace(n.ND18,',','.')) ND18, avg(replace(n.ND19,',','.')) ND19, avg(replace(n.ND20,',','.')) ND20,
            avg(replace(n.ND21,',','.')) ND21, avg(replace(n.ND22,',','.')) ND22, avg(replace(n.ND23,',','.')) ND23, avg(replace(n.ND24,',','.')) ND24, avg(replace(n.ND25,',','.')) ND25, avg(replace(n.ND26,',','.')) ND26, avg(replace(n.ND27,',','.')) ND27, avg(replace(n.ND28,',','.')) ND28, avg(replace(n.ND29,',','.')) ND29, avg(replace(n.ND30,',','.')) ND30,
            avg(replace(n.ND31,',','.')) ND31, avg(replace(n.ND32,',','.')) ND32, avg(replace(n.ND33,',','.')) ND33, avg(replace(n.ND34,',','.')) ND34, avg(replace(n.ND35,',','.')) ND35, avg(replace(n.ND36,',','.')) ND36, avg(replace(n.ND37,',','.')) ND37, avg(replace(n.ND38,',','.')) ND38, avg(replace(n.ND39,',','.')) ND39, avg(replace(n.ND40,',','.')) ND40,
            avg(replace(n.ND41,',','.')) ND41, avg(replace(n.ND42,',','.')) ND42, avg(replace(n.ND43,',','.')) ND43, avg(replace(n.ND44,',','.')) ND44, avg(replace(n.ND45,',','.')) ND45, avg(replace(n.ND46,',','.')) ND46, avg(replace(n.ND47,',','.')) ND47, avg(replace(n.ND48,',','.')) ND48, avg(replace(n.ND49,',','.')) ND49, avg(replace(n.ND50,',','.')) ND50,
            avg(replace(n.ND51,',','.')) ND51, avg(replace(n.ND52,',','.')) ND52, avg(replace(n.ND53,',','.')) ND53, avg(replace(n.ND54,',','.')) ND54, avg(replace(n.ND55,',','.')) ND55, avg(replace(n.ND56,',','.')) ND56, avg(replace(n.ND57,',','.')) ND57, avg(replace(n.ND58,',','.')) ND58, avg(replace(n.ND59,',','.')) ND59, avg(replace(n.ND60,',','.')) ND60,
            avg(replace(n.N1,',','.')) N1, avg(replace(n.N2,',','.')) N2, avg(replace(n.N3,',','.')) N3, avg(replace(n.N4,',','.')) N4, avg(replace(n.N5,',','.')) N5, avg(replace(n.N6,',','.')) N6, avg(replace(n.N7,',','.')) N7, avg(replace(n.N8,',','.')) N8, avg(replace(n.N9,',','.')) N9,
            avg(replace(n.F1,',','.')) F1, avg(replace(n.F2,',','.')) F2, avg(replace(n.F3,',','.')) F3, avg(replace(n.F4,',','.')) F4, avg(replace(n.F5,',','.')) F5, avg(replace(n.F6,',','.')) F6, avg(replace(n.F7,',','.')) F7, avg(replace(n.F8,',','.')) F8, avg(replace(n.F9,',','.')) F9,
            avg(replace(n.MediaFinal,',','.')) MediaFinal, avg(replace(n.MediaParcial,',','.')) MediaParcial,
            r.Situacao
        from TblNotas n
            join TblMatricula m on (not m.Excluir) and m.Codigo=n.MatriculaCod and m.Codigo=${req.escape(req.matricula.mCodigo)}
            join TblDisciplina d on (not d.Excluir) and d.Codigo=n.DisciplinaCodigo
            join TblTurmaDisciplina td on (not td.Excluir) and td.TurmaCodigo=m.TurmaCodigo and td.AnoBase in (0,m.AnoBase)
            left join TblResultado r on (not r.Excluir) and r.Ano=m.AnoBase and r.CodTurma=m.TurmaCodigo and r.CodAluno=m.AlunoCodigo
        where (not n.Excluir)
        order by td.Pos_Ordem, d.Disciplina
        limit 1`);
    res.json(r || {erro:'Nenhum registro encontrado'})
})

//irmãos do aluno
router.get('/irmaos', async (req, res) => {
    const cpfres = req.aluno.RespCPF.replace(/[\.\-]/g,'');
    var r = await req.connectionAluno.Table(`select Codigo, Nome, DataNasc, Responsavel, RespCPF cpf
        from TblAluno
        where replace(replace(RespCPF,".",""),"-","")=${req.escape(cpfres)}`);
    if(r)
        if(r.length > 0)
            r = r.filter( d => {
                if(!d.cpf) return false;
                if(!d.cpf.trim()) return false;
                const cpf = d.cpf.replace(/[^\d]+/g,'');
                return !(
                    /^0+$/.test(cpf) ||
                    /^1+$/.test(cpf) ||
                    /^2+$/.test(cpf) ||
                    /^3+$/.test(cpf) ||
                    /^4+$/.test(cpf) ||
                    /^5+$/.test(cpf) ||
                    /^6+$/.test(cpf) ||
                    /^7+$/.test(cpf) ||
                    /^8+$/.test(cpf) ||
                    /^9+$/.test(cpf)
                )
            })
    var ret = [];
    for(var n = 0; n < r.length; n++){
        var alu = r[n];
        var mat = await req.connectionAluno.Line(`select m.Codigo mCodigo, m.AnoBase, m.AlunoCodigo aCodigo,
                t.Codigo tCodigo, t.Turma, t.Turma_Tipo, t.Turno, t.Curso_Grau, m.Codigo mCodigo
            from TblMatricula m
                join TblTurma t on (not t.Excluir) and t.Codigo=m.TurmaCodigo
            where (not m.Excluir) and m.AlunoCodigo=${req.escape(alu.Codigo)}
            order by m.AnoBase desc
            limit 1`)
        if(mat){
            ret.push({
                aluno:alu,
                matricula:mat || {}
            })
        }
    }
    res.json(ret)
})

//setar irmão
router.get('/setirmao/:alu', async (req, res) => {
    const alu = req.params.alu;
    const r = await req.connectionAluno.Line(`select *
        from TblAluno
        where Codigo=${req.escape(alu)}`);
    const mat = await req.connectionAluno.Line(`select m.Codigo mCodigo, m.AnoBase, m.AlunoCodigo aCodigo,
            t.Codigo tCodigo, t.Turma, t.Turma_Tipo, t.Turno, t.Curso_Grau, m.Codigo mCodigo
        from TblMatricula m
            join TblTurma t on (not t.Excluir) and t.Codigo=m.TurmaCodigo
        where (not m.Excluir) and m.AlunoCodigo=${req.escape(alu)}
        order by m.AnoBase desc
        limit 1`);
    req.setTokenData({
        aluno:r,
        matricula:mat
    })
    req.aluno = r;
    req.matricula = mat;
    res.json({
        aluno:r,
        matricula:mat
    })
})

//foto do aluno
router.get('/fotoaluno/:alu?', async (req,res) => {
    const alu = req.params.alu || req.aluno.Codigo ;
    const r = await req.connectionAluno.Line(`select Foto
        from TblAlunoImg
        where IdImgAluno=${req.escape(alu)}`);
    res.setHeader('Content-Type','image/jpeg');
    if(r){
        if(r.Foto.length > 10){
            res.send(r.Foto)
            return;
        }
    }
		fs.readFile(__dirname.replace(/\\/g,"/")+'/../img/jpg/nofoto.jpg',(e,r) => {
			if(!e) return res.send(r);
			console.error(e);
			res.send('Erro')
		});
})

//lista de matrículas do aluno
router.get('/matriculas', async (req,res) => {
    const mat = await req.connectionAluno.Table(`select m.Codigo mCodigo, m.AnoBase, m.AlunoCodigo aCodigo,
            t.Codigo tCodigo, t.Turma, t.Turma_Tipo, t.Turno, t.Curso_Grau, m.Codigo mCodigo
        from TblMatricula m
            join TblTurma t on (not t.Excluir) and t.Codigo=m.TurmaCodigo
        where (not m.Excluir) and m.AlunoCodigo=${req.escape(req.aluno.Codigo)}
        order by m.AnoBase desc`);
    res.json(mat);
})

//disciplinas do aluno

router.get('/disciplinas', async (req,res) => {
    const mat = req.matricula;
    const dis = await req.connectionAluno.Table(`select d.Codigo dCodigo, d.Disciplina,
            n.MediaParcial, n.MediaFinal, n.Resultado,
            n.N1, n.N2, n.N3, n.N4, n.N5, n.N6, n.N7, n.N8, n.N9, n.ocultar_registro,
            td.Pos_Ordem,
            if(td.CargaHoraria,td.CargaHoraria,d.CargaHora) CargaHoraria,
            # if(td.Parte_Diversificada,td.Parte_Diversificada,d.Parte_Diversificada) Parte_Diversificada
            if(td.Parte_Diversificada,'S','N') Diversificada
        from TblMatricula m
            join TblTurmaDisciplina td on (not td.Excluir) and td.TurmaCodigo=m.TurmaCodigo and td.AnoBase in (0,m.AnoBase)
            join TblDisciplina d on (not d.Excluir) and d.Codigo=td.DisciplinaCodigo
            join TblNotas n on (not n.Excluir) and n.DisciplinaCodigo=d.Codigo and n.MatriculaCod=m.Codigo
        where m.Codigo=${mat.mCodigo}
        order by td.Pos_Ordem, d.Disciplina`);
    res.json(dis);
})

module.exports = router;
