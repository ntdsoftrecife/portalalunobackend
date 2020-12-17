const express = require('express');
const cors = require('cors')
var {tokenRouter} = require('./componentes/token')
const https = require('https');
const http = require('http');
const fs = require('fs') 

const whiteList = [
    /^(https?:\/\/|)localhost/,
    /^(https?:\/\/|)ntdsoft.com/,
    /^(https?:\/\/|)ntdsoft.net/,
]

const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(cors({
    credentials:true,
    origin:(origen, callback) => {
        var ok = false;
        callback(null,true)
    }
}))

app.get('/testsite',(req,res) => res.send('Site rodando bem'))

app.set('view engine','html')

app.use('/aluno',require('./routers/frontend'))

app.use('/',tokenRouter('tokenaluno'));
app.use('/',require('./componentes/mysqlcli').mysqlRouter);
app.use('/backaluno',require('./routers/login'));

app.use('/',require('./routers/presenceanalize'));

app.use('/backaluno/aluno',require('./routers/aluno'));
app.use('/backaluno/notas',require('./routers/notas'));
app.use('/backaluno/agenda',require('./routers/agenda'));
app.use('/backaluno/arquivo',require('./routers/arquivos'));
app.use('/backaluno/agendainfantil',require('./routers/agendainfantil'));
app.use('/backaluno/financeiro',require('./routers/financeiro'));
app.use('/backaluno/frequencia',require('./routers/frequencia'));
app.use('/backaluno/videoaula',require('./routers/videoaula'));
app.use('/backaluno/exercicio',require('./routers/exercicios'));
app.use('/backaluno/avisos',require('./routers/avisos'));
app.use('/backaluno/accessstudents',require('./routers/accessstudents'));


app.all(/(.*)/,(req,res) => {
    res.status(404).json({
        erro:'Página não encontrada'
    })
})


/*var methodOverride = require('method-override');
app.use(methodOverride());
app.use(function(err, req, res, next) {
  console.error('Erro geral:',err.stack);
	res.status(500);
	res.render('error',{error:err});
});*/


const PATH = __dirname.replace(/\\/g,"/");

const key = fs.readFileSync(PATH+'/credencial/HSSL-5e5f04cdd7a10.key')
const cert = fs.readFileSync(PATH+'/credencial/ntdsoft_net_br.crt')

const httpsServer = https.createServer({
    key:key,
    cert:cert
},app)

const httpServer = http.createServer({}, app);

httpsServer.listen(8000, e => console.log('Alunoserver HTTPS rodando em 8000'));
httpServer.listen(8013, e => console.log('Alunoserver HTTP rodando em 8013'));