const express = require('express');
const router = express.Router();
const fs = require('fs');


const path = __dirname.replace(/\\/g,"/") + "/../aluno12"

router.get(/\/(.*)$/,(req,res) => {
	try{
		const path = __dirname.replace(/\\/g,'/') + '/frontend';
		var arq = path + (req.params[0] || 'index.html').replace(/^([^\/])/,'/$1');
		var arqini = path + ('index.html').replace(/^([^\/])/,'/$1');
		fs.stat(arq,(err,state) => {
			if(err){
				return res.sendFile(arqini);
			}
			res.sendFile(arq);
		})
	}catch(e){
		console.error('Erro de frontend: ',e);
		res.send('Erro de leitura de arquivo')
	}
})


module.exports = router;
