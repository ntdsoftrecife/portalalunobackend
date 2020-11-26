const router = require('express').Router()


router.get('/list/:categoria',async (req,res) => {
	const matricula = req.matricula;
	const {categoria} = req.params;
	const r = await req.connectionAluno.Query(`select va.id, va.link, va.titulo, va.detalhe, va.date, va.icone, va.categoria
		from videoaula va
			join videoaulaturma vat on vat.videoid=va.id
			join TblMatricula m on (not m.Excluir) and m.Codigo=? and m.TurmaCodigo=vat.turmaid and va.ano in (null,0,m.AnoBase)
		where substr(va.titulo,1,1) <> '$' and ? in (va.categoria,'al')
		order by va.date desc
		limit 1000`,[matricula.mCodigo , categoria || 'vd']);
	if(!r) return res.json({erro:'Falha ao tentar consultar a lista de registros'})
	res.json(r || []);
});


module.exports = router;
