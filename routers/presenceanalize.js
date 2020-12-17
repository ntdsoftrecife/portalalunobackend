const router = require('express').Router()
const fs = require('fs')
const path = require('path')

/*
    drop table student_presence_apk;

    create table if not exists student_presence_apk(
        id int primary key auto_increment,
        date date not null,
        time time not null,
        matricula int not null,
        unique key (date,matricula)
    )engine=myisam;

    process:
        1. register student if no register

*/

var today = new Date();



var infos = {
    date:new Date(),
    students:[]
}

const fileInfo = path.join(__dirname, 'presenceanalize', 'infosPresenceStudent.json');


const readFile = () => new Promise( res => {
    fs.readFile(fileInfo,(err,result) => {
        if(err) return console.error(err)
        try{
            const js = JSON.parse(result);
            infos = js;
        }catch(e){
            console.error(e)
        }
    })
} )


const writeInfos = () => new Promise( res => {
    fs.writeFile(fileInfo, JSON.stringify(infos), err => {
        if(err) console.error('ERRO:','Falha ao tentar registrar os dados de presença do aluno',err);
        res(err ? false : true)
    })
} )


const processPresence = async (schoolId, matriculaId, connectionAluno) => {
    //if(infos.students.find( data => data.schoolId == schoolId && data.matriculaId == matriculaId )) return;
    if(schoolId == 204)
        console.log(`Register school ${schoolId}, matric ${matriculaId}`)
    const ret = await connectionAluno.Query(`insert ignore into student_presence_apk (date, time, matricula) values (now(), now(), ?)`, matriculaId)
    if(schoolId == 204)
        console.log('return',ret)
    await writeInfos()
}


const presenceReset = async () => {
    if( (new Date()).toLocaleString().substr(0,13) != infos.date.toLocaleString().substr(0,13) ){
        console.log('Presence register restart')
        infos.students = new Date();
        infos.students = [];
        await writeInfos()
    }
}


const init = async () => {
    await readFile();
    presenceReset()
    setInterval(presenceReset, 1000 * 60 )
}



init();

router.all(/.*/,async (req,res) => {
    const {escola = {id:0}, matricula = {mCodigo:0}, connectionAluno} = req;
    try{
        if(escola.id && matricula.mCodigo)
            processPresence(escola.id, matricula.mCodigo, connectionAluno)
    }catch(e){
        console.log(e)
    }
    req.next()
})


module.exports = router;