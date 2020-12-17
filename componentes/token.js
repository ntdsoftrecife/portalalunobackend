const fs = require('fs');

const PATH = __dirname.replace(/\\/g,'/')+'/bintoken/';


const errou = tex => {
	if(!tex) return;
	console.error(tex);
	const arq = __dirname.replace(/\\/g,'/') + '/token_erro.inf';
	fs.appendFile(arq,`${(new Date()).toString()}\n${tex}\n\n`, err => { if(err) console.error(err) });
}

/*
    token(chave_do_token)
*/
const token = tk_ => {

    let tk = tk_;
    let js = false;
    let ret;

    ret = {
        setItem:(item) => new Promise((res,rej) => {
					item.token = tk;
					item._dataupdate = Date.now();
					fs.writeFile(PATH + tk+'.json', JSON.stringify(item), err =>{
						if(!err) return res(true)
						errou(err);
						res(ret)
					})
					js = item;
					res(ret)
        }),
        putItem:(item) => new Promise(async (res,rej) => {
					var itm = (await ret.getItem()).toArray() || {};
					let f;
					f = trans = (fon,des) => {
							for(var i in fon){
									if(typeof fon[i] == 'object'){
											if(typeof des[i] != 'object') des[i] = {}
											f(fon[i],des[i])
									}else{
											des[i] = fon[i];
									}
									
							}
					}
					f(item,itm);
					await ret.setItem(itm)
					res(ret);
        }),
        getItem:() => new Promise((res,rej)=>{
					js = false;
					var arq = PATH + tk+'.json';
					fs.readFile(arq,(err,r) => {
						if(err){
							return res(ret)
							//return errou(err);
						}
						js = JSON.parse(r) || {};
						res(ret);
					})
        }),
        drop:() => new Promise((res,rej) => {
						var arq = PATH + tk+'.json';
						//console.log('DROP TOKEN: ',arq);
						fs.unlink(arq,err => {
							if(err){
								errou(err);
								return res(ret)
							}
							res(ret)
						})
        }),
        toArray:(default_=false) => js || default_,
        toJSON:(default_=false) => JSON.stringify(js) || default_
    }

    return ret;

}

const getToken = () => {
    const dic = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
    const qdic = dic.length-1;
    var ret = '';
    for(var n = 0; n < 20; n++){
			ret += dic.substr(parseInt(Math.random() * qdic),1);
    }
		return ret;
}

const parseCookie = (requisicao) => {
    var resu = {};
    const ck = requisicao.headers.cookie || false ;
    if(ck)
        ck.split(';').forEach( s =>
            s.replace(/(.*?)=(.*)/g, (m,t,v) => resu[t.trim()] = v )
        );
    return resu;
}

/*
Exemplo:
    app.use("/aluno",tokenRouter('tokenaluno'))
    app.get("/aluno",(req,res) => {
        console.log('TOKEN: ',req.token); //chave do token
        console.log('TOKEN DATA: ',req.getTokenDate()); //retorna um array dos dados do token
        req.setTokenDate({}); //da um putItem no token ativo
        req.dropToken(); //deleta o token ativo atualmente
    })
*/
const tokenRouter = name => {
    const router = require('express').Router();
    router.all(/.*/,async (req,res) => {
				const {tokenAluno} = req.query;
				let t = tokenAluno;
				if(!t){
					//configurar cookie
					const cookies = parseCookie(req)
					t = cookies[name] || false;
					if(!t){
						t = getToken();
						var dt = new Date()
						dt.setFullYear(dt.getFullYear()+1)
						res.setHeader('Set-Cookie',[name+'='+t]+';expires='+dt.toUTCString())
					}
				}
				//definir token
				if(!t) return res.json({erro:'Token não pode ser definido'})
				req.token = t;
				const gi = token(t).getItem;
        req.getTokenData = async () => (await gi()).toArray();
        req.setTokenData = async data => await token(t).putItem(data);
        req.dropToken = async () => await token(t).drop();
        const d = await req.getTokenData();
        req.escola = d.escola || null ;
        req.matricula = d.matricula || null ;
        req.aluno = d.aluno || null ;
        req.nivel = d.nivel || null ;
        req.next();
    });
    return router;
}

exports.token = token;
exports.getToken = getToken;
exports.parseCookie = parseCookie;
exports.tokenRouter = tokenRouter;
