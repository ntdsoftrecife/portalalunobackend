const express = require('express');
const router = express.Router();
const fs = require('fs');
const http = require('http');
const {PATH_FILES} = require('./../componentes/configbd')


const mime = {
    /*html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript',*/

    aac:'audio/aac',
    abw:'application/x-abiword',
    arc:'application/octet-stream',
    avi:'video/x-msvideo',
    azw:'application/vnd.amazon.ebook',
    bin:'application/octet-stream',
    bz:'application/x-bzip',
    bz2:'application/x-bzip2',
    csh:'application/x-csh',
    //css:'text/css',
    csv:'text/csv',
    doc:'application/msword',
    eot:'application/vnd.ms-fontobject',
    epub:'application/epub+zip',
    gif:'image/gif',
    //htm:'text/html',
    //html:'text/html',
    ico:'image/x-icon',
    ics:'text/calendar',
    jar:'application/java-archive',
    jpeg:'image/jpeg',
    jpg:'image/jpeg',
    //js:'application/javascript',
    //json:'application/json',
    mid:'audio/midi',
    midi:'audio/midi',
    mpeg:'video/mpeg',
    mpkg:'application/vnd.apple.installer+xml',
    odp:'application/vnd.oasis.opendocument.presentation',
    ods:'application/vnd.oasis.opendocument.spreadsheet',
    odt:'application/vnd.oasis.opendocument.text',
    oga:'audio/ogg',
    ogv:'video/ogg',
    ogx:'application/ogg',
    otf:'font/otf',
    png:'image/png',
    pdf:'application/pdf',
    ppt:'application/vnd.ms-powerpoint',
    rar:'application/x-rar-compressed',
    rtf:'application/rtf',
    sh:'application/x-sh',
    svg:'image/svg+xml',
    swf:'application/x-shockwave-flash',
    tar:'application/x-tar',
    tif:'image/tiff',
    tiff:'image/tiff',
    ts:'application/typescript',
    ttf:'font/ttf',
    vsd:'application/vnd.visio',
    wav:'audio/x-wav',
    weba:'audio/webm',
    webm:'video/webm',
    webp:'image/webp',
    woff:'font/woff',
    woff2:'font/woff2',
    xhtml:'application/xhtml+xml',
    xls:'application/vnd.ms-excel',
    xlsx:'application/vnd.ms-excel',
    xlsx:'application/vnd.ms-excel',
    xml:'application/xml',
    xul:'application/vnd.mozilla.xul+xml',
    zip:'application/zip',
    '3gp':'video/3gpp',
    '3gp':'audio/3gpp',
    '3g2':'video/3gpp2',
    '3g2':'audio/3gpp2',
    '7z':'application/x-7z-compressed'
};

const render = (res,arq) => new Promise((rs,rj) => {
    const ext = arq.replace(/^.*\.([^\.]+)$/,'$1');
    //res.setHeader("Content-Type", mime[ext] || 'text/plain')
		fs.readFile(arq,(e,r) => {
			if(!e){
				res.setHeader("Content-Type", 'application/octet-stream')
				res.send(r);
				return rs(true)
			}
			rs(false)
		})
})


//lista de arquivos
router.get('/arquivoslist/',async (req,res) => {
    const matricula = req.matricula;
    const ret = await req.connectionAluno.Table(`select t.Turma, t.Turma_Tipo, t.Curso_Grau, t.Codigo tCodigo,
            aa.titulo, aa.ano, aa.id aaid,
            d.Disciplina, d.Codigo dCodigo,
            u.UsuNomeCompleto, u.UsuCodigo,
            aaa.arquivo, aaa.id id, aaa.lista
        from arquivos_alunos aa
            join arquivos_alunos_arq aaa on aaa.lista=aa.id
            left join TblTurma t on (not t.Excluir) and t.Codigo=aa.turma
            left join TblUsuario u on u.UsuCodigo=aa.usuario
            left join TblDisciplina d on d.Codigo=aa.disciplina
        where 
            aa.turma in (0,${req.escape(matricula.tCodigo)}) and
            aa.ano in (0,${req.escape(matricula.AnoBase)}) and
            aa.aluno in (0,${req.escape(matricula.aCodigo || matricula.AlunoCodigo)})`)
    res.json(ret || []);
})

//download de um arquivo específico
router.get('/download/:arq',async (req,res) => {
    const escola = req.escola;
    const arq1 = '/home/ntdsoftetbr/www/notas/clientes/'+escola.banco+'/arquivos/empresa/'+(req.params.arq || '---')
    const arq2 = '/home/ntdsoftnet/www/notas/clientes/'+escola.banco+'/arquivos/empresa/'+(req.params.arq || '---')
		if(!(await render(res,arq2)))
			if(!(await render(res,arq1)))
        res.send('Arquivo não existe mais no sistema')
})


module.exports = router;
