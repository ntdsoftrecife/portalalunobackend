const router = require('express').Router();


/*
    create table if not exists access_students(
        id int primary key auto_increment,
        data text
    )engine=myisam
    $$$$

    insert ignore into access_students (id,data) values (1,'{}')
*/

// /backaluno/accessstudents      /accessstudents
router.get('/',async (req,res) => {
    const {Query} = req.connectionAluno;
    var ret = await Query(`select * from access_students where id=1`)
    ret = ret.find(v=>1) || {id:1, data:'{}'} ;
    ret.data = JSON.parse(ret.data);
    res.json( ret )
})


module.exports = router;