/*
acessa exercicios
			esta fazendo exercicio?
		sim
			captura o status e vai para o exercício no seu último status
			cada resposta registra o status
			terminou?
				sim
					grava no banco de dados, limpa o data, vai para o início de exercícios
				não
					continua fazendo o exercício
		não
			opções de ver notas e ver exercícios para fazer
				notas:
					clica em uma nota:
						ver as tentativa e as notas tiradas
				exercícios
					clica em um exercício:
						aviso para iniciação
						armazena os dados e inicia exercício
						cada resposta registra o status
						terminou?
							sim
								grava no banco de dados, limpa o data, vai para o início de exercícios
							não
								continua fazendo o exercício
					
*/

const router = require('express').Router();
const fs = require('fs');

function _questao(){
	const arq = __dirname.replace(/\\/g,'/') + '/queststate.json';
	let data = fs.existsSync(arq) ? JSON.parse(fs.readFileSync(arq)) : {};

	const write = () => {
		try{ fs.writeFileSync(arq,JSON.stringify(data)); }catch(e){ console.error(e); };
	}

	let r = {};

	r.iniciar = (escola, aluno, exercicio,questoes) => {
		if(!data[escola]) data[escola] = {};
		if(!data[escola][aluno]) data[escola][aluno] = {};
		data[escola][aluno] = {
				date:(new Date()).toString(),
				exercicio,
				questoes,
				questindex:0
			}
		//write();
	}
	r.status = (escola,aluno) => {
		if(!data[escola]) return null;
		if(!data[escola][aluno]) return null;
		return data[escola][aluno].questoes[ data[escola][aluno].questindex ] || null;
	}
	r.up = (escola,aluno) => {
		if(!data[escola]) return null;
		if(!data[escola][aluno]) return null;
		data[escola][aluno].questindex++;
		return data[escola][aluno].questoes[ data[escola][aluno].questindex ] || null;
	}
	r.finish = (escola,aluno) => {
		delete data[escola][aluno];
		var ok = true;
		for(var i in data){ ok = true; break; }
		if(!ok) delete data[escola];
	}

	setInterval(write,1000 * 5);

	return r;
}

//const questao = _questao();

//se estiver fazendo algum exercício abre diretamente aqui
//router.get(/\/*/,(req,res) => {
//	const data = questao.status(req.escola.id,req.aluno.id);
//	if(!data) return req.next();
//	res.json(data)
//})


//lista de exercícios para o aluno fazer
router.get('/list',async (req,res) => {
	const {mCodigo, aCodigo} = req.matricula;
	var r = await req.connectionAluno.Query(`select ee.id, ee.chance, ee.titulo, ee.qtd_pergunta, ee.datecreate,
					d.Codigo dCodigo, d.Disciplina, chance
				from exer_exercicio ee
					join TblMatricula m on (not m.Excluir) and m.Codigo=? and m.TurmaCodigo=ee.turma and m.AnoBase=ee.ano
					join TblDisciplina d on (not d.Excluir) and d.Codigo=ee.disciplina
				where (not ee.bloqueado) and (not ee.excluido)
				order by ee.datecreate desc, id desc`,[mCodigo]);
	if(!r) return res.json({erro:'Erro de consulta'});
	const idsExer = r.map( l => parseInt(l.id) || 0 );
	var r2 = idsExer == 0 ? [] :
				await req.connectionAluno.Query(`select eaf.exercicio eeid, eaf.datahora, eaf.id eafid,
					era.id eraid, era.resposta,
					ees.resposta respostacerta
				from exer_aluno_fez eaf
					join exer_resp_alunos era on (not era.excluido) and (not era.bloqueado) and era.questoes=eaf.id
					join exer_exercicios ees on (not ees.bloqueado) and (not ees.excluido) and ees.id=era.pergunta
				where (not eaf.excluido) and eaf.aluno=? and eaf.exercicio in (${idsExer})`,[aCodigo])
	if(!r2) return res.json({erro:'Erro de consulta'})
	r = r.map( l => {
		var exs = r2.filter( l2 => l2.eeid == l.id );
		var group = {};
		exs.map( l2 => {
			if(!group[l2.eafid]) group[l2.eafid] = [];
			group[l2.eafid].push(l2);
		});
		var g2 = [];
		for(var i in group) g2.push(group[i]);
		l.group = g2;
		return l;
	} )
	res.json(r || []);
})

//questão do exercício que está sendo respondida
router.get('/initquestao/:idexer',async (req,res) => {
	const {idexer} = req.params;
	const {mCodigo, tCodigo, aCodigo, AnoBase} = req.matricula;
	var r1 = await req.connectionAluno.Query(`select id, turma, chance, titulo, qtd_pergunta, ano,
					d.Codigo dCodigo, d.Disciplina
				from exer_exercicio ee
					join TblDisciplina d on (not d.Excluir) and d.Codigo=ee.disciplina
				where (not ee.bloqueado) and (not ee.excluido) and ee.id=?`,[ idexer ]);
	if(!r1) return res.json({erro:'Exercício não encontrado ou ainda está em desenvolvimento'});
	if(r1.length == 0) return res.json({erro:'Nenhum exercício encontrado com o id "'+idexer+'"'})
	r1 = r1[0];
	if(r1.turma != tCodigo) return res.json({erro:'Acesso referente a turma inválido'});
	if(r1.ano != AnoBase) return res.json({erro:'Acesso referente a ano inválido'});

	var r2 = await req.connectionAluno.Query(`select id, exercicio, pergunta, opc1, opc2, opc3, opc4, opc5
				from exer_exercicios
				where (not bloqueado) and (not excluido) and exercicio=?
				order by rand()
				limit ?`,[idexer, r1.qtd_pergunta]);
	if(!r2) return res.json({erro:'Erro ao tentar capturar as perguntas'});
	if(r2.length < r1.qtd_pergunta) return res.json({erro:'A questão ainda está em desenvolvimento. Tente novamente mais tarde.'});
	r1.questions = r2;
	const r3 = await req.connectionAluno.Query(`insert into exer_aluno_fez (aluno, exercicio, datahora,bloqueado,excluido)
							values (?,?,now(),1,1)`,[aCodigo,idexer]);
	if(!r3) return res.json({erro:'Falha ao tentar iniciar o exercício'});
	r1.eaf = r3.insertId;
	res.json(r1);
})

//responder questão
router.post('/setresposta',async (req,res) => {
	const {eaf, respostas, quest} = req.body;
	var r1 = await req.connectionAluno.Query(`select ee.qtd_pergunta
				from exer_aluno_fez eaf
					join exer_exercicio ee on (not ee.bloqueado) and (not ee.excluido) and ee.id=eaf.exercicio
				where eaf.id=?`,
				[ eaf ]);
	if(!r1) return res.json({erro:'Houve algum erro de consulta'});
	if(r1.length == 0){
		await req.connectionAluno.Query(`delete from exer_aluno_fez where id=?`,eaf);
		return res.json({noBuff:1, erro:'O exercício foi desativado pelos administradores, sua resposta não poderá ser gravada'});
	}
	r1 = r1[0];
	const {qtd_pergunta} = r1;
	var r2 = await req.connectionAluno.Query(`select ees.id, ees.resposta
				from exer_exercicios ees
				where ees.id in (?) and (not ees.bloqueado) and (not ees.excluido)`,[quest]);
	if(!r2) return res.json({erro:'Houve algum erro na consulta para comparar as respostas'});
	if(r2.length != quest.length){
		await req.connectionAluno.Query(`delete from exer_aluno_fez where id=?`,eaf);
		return res.json({noBuff:1, erro:'Houve alguma alteração neste exercício por parte dos administradores e por isso não poderá ser salvo'});
	}
	var acertos = 0;
	var datawrt = [];
	r2.map( l => {
		var i = quest.indexOf(l.id);
		const respa = respostas[i];
		if(respa == l.resposta) acertos++;
		datawrt.push([l.id, respa, eaf, 0, 0])
	} )
	const i1 = await req.connectionAluno.Query(`insert into exer_resp_alunos (pergunta, resposta, questoes, bloqueado, excluido) values ?`,[datawrt]);
	const i2 = await req.connectionAluno.Query(`update exer_aluno_fez set excluido=0, bloqueado=0 where id=?`,[eaf]);
	res.json({ nota: ( 10 / quest.length * acertos ) });
})


module.exports = router;
