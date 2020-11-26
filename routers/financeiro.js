const express = require('express')
const router = express.Router()
const axios = require('axios');


router.get('/listmensalidades',async (req,res) => {
    const mat = req.matricula.mCodigo;
    const r = await req.connectionAluno.Table(`select me.Codigo,
            me.Referente,
            date_format(me.Vencimento,'%d/%m/%Y') Vencimento,
            me.ValorMensalidade,
                me.ValorTotal,
            if(me.Pago,'S','N') Pago,
            if(me.DataPgto, date_format(me.DataPgto,'%d/%m/%Y'), null) DataPgto,
            me.CobrancacheckoutUrl,
            m.Codigo mCodigo,
                m.AnoBase,
            t.Codigo tCodigo,
            concat_ws(' ',t.Turma, t.Turma_Tipo, '-', t.Turno, '-', t.Curso_Grau) turma,
            if( (ti.IdBanco is null) or (not ti.IdBanco) , 0 , ti.IdBanco ) IdBanco,
            if( me.Pago, 2, if( date(me.Vencimento) < date(now()) , 1 , 0 ) ) Status
        from TblMensalidade me
            join TblAluno a on (not a.Excluir) and a.Codigo=me.AlunoCodigo
            join TblMatricula m on (not m.Excluir) and
                if(
                    me.MatriculaCod,
                    me.MatriculaCod=m.Codigo ,
                    m.AnoBase in (me.AnoBase) and me.TurmaCodigo in (m.TurmaCodigo)
                ) and
                m.AlunoCodigo=a.Codigo and m.Codigo=${req.escape(mat)}
            join TblTurma t on (not t.Excluir) and t.Codigo=m.TurmaCodigo
            left join TblTitulos ti on (not ti.Excluir) and ti.ID_Mensalidade=me.Codigo
        where (not me.Excluir)
        order by if(me.Pago,1,0), m.AnoBase desc, me.DataPgto desc, me.Vencimento desc
        limit 200`);
    res.json(r || []);
})

router.get('/printmens/:mensalidade', async (req,res) => {
    const DOMINIO = 'https://ntdsoft.net.br/boleto/';
    const {mensalidade} = req.params;
    const r = await req.connectionAluno.Line(`select me.Codigo meCodigo, ti.IdBanco, me.CobrancacheckoutUrl
            from TblMensalidade me
                left join TblTitulos ti on (not ti.Excluir) and ti.ID_Mensalidade=me.Codigo
            where me.Codigo=${req.escape(mensalidade)}`)
    if(!r) return res.send('mensalidade não encontrada');
    var {meCodigo, IdBanco, CobrancacheckoutUrl} = r;
    if(IdBanco == 'null' || IdBanco == null || !IdBanco) IdBanco = 0;
        //return res.send('<h3>Este pagamento só pode ser realizado na própria instituição de ensino.</h3>')
    const {banco, user_bd, pass_bd} = req.escola;
    if(CobrancacheckoutUrl){
        res.redirect(CobrancacheckoutUrl)
    }else{
        const url = `${DOMINIO}boletoserie.php?banco=${banco}&user_bd=${user_bd}`+
                `&pass_bd=${pass_bd}&idmens=${meCodigo}&idbancos=${IdBanco}`;
        console.log('URL: ',url)
        axios.get(url).then(d => {
            res.send(d.data.replace(/(src=[\\\"\\'])([^\\\"\\']*?)([\\\"\\'])/g, "$1"+DOMINIO+"$2$3"))
        }).catch(e => {
            console.error(e);
            res.send('Requisição de boleto inválida')
        })
    }
})

//  /backaluno/financeiro/gettokenpagar/:mensalidade
router.get('/gettokenpagar/:mensalidade',async (req,res) => {
    const {id} = req.escola || {};
    const {mensalidade} = req.params;
    axios.get(`https://ntdsoft.net/pagamento/ntd/pgtotokgdsd6g5es65hg9sd5hgs9eg2asgdsd.php?site=${id}&idmens=${mensalidade}`)
        .then(tk => {
            const {data} = tk || {}
            if(!data) return res.json({erro:'Nenhum token gerado'})
            res.json({token:data})
        })
        .catch(err => {
            console.error(err)
            res.json({erro:'Falha ao tentar adquirir o token de solicitação de pagamento'})
        })
})
/*
global $conector_cliente, $login;
        $DOMINIO = 'https://ntdsoft.net/boleto/';
        $idmensalidade = request('idm');
        $idbanco = request('idb');
        $lk = $DOMINIO . "boletoserie.php?banco={$login->banco}&user_bd={$login->user_bd}".
                "&pass_bd={$login->pass_bd}&idmens={$idmensalidade}&idbancos={$idbanco}";
        $s = file_get_contents($lk);
        $s = preg_replace("/(src=[\\\"\\'])([^\\\"\\']*?)([\\\"\\'])/", "$1".$DOMINIO."$2$3", $s);
        echo $s;
*/


module.exports = router;


/*

*/