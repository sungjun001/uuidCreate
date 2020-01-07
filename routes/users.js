var express = require('express');

var router = express.Router();
var router = express();

//router.use(express.json());
//router.use(express.urlencoded({ extended: false }));

'user strict';
var sql = require('../config/mysqldb.js');

/* GET users listing. */
router.get('/create', function(req, res, next) {
    var paramType = req.param.type;
    var uuidV4 = require('uuid/v4');
    var moment = require('moment');
    var validPeriod = moment().add(7, 'd').format("YYYY-MM-DD HH:mm:ss");
    var serialNo = req.query.serialNo;
    var uuid = "";
    if ( serialNo == null) {
      res.json({ result : 'FAIL' });
      return;
    }

    const dbTest = async () => {
        try {
            const connection = await sql.getConnection(async conn => conn);
            try {
                /* Step 3. */
                var post  = {serialNo:serialNo};
                const [result] = await connection.query('SELECT accessKey, validPeriod FROM accessKey WHERE ? and validPeriod >= now() order by validPeriod desc ', post);
                connection.release();
                console.log('dbTest rows', result);

                console.log('dbTest rows length', result.length);

                if (result.length > 0) {
                    uuid = result[0].accessKey;
                    validPeriod = result[0].validPeriod;
                }

                return result;

            } catch(err) {
                connection.release();
                console.log('dbTest Query Error : ', err);
                return false;
            }
        } catch(err) {
            console.log('dbTest DB Error : ', err);
            return false;
        }
    };

    const dbinsert = async () => {
        try {
            const connection = await sql.getConnection(async conn => conn);
            try {

                uuid = uuidV4();
                post  = {accessKey:uuid, serialNo:serialNo, validPeriod:validPeriod};
                const [result] = await connection.query('INSERT INTO accessKey SET ?', post);
                connection.release();
                console.log('dbinsert rows result : ', result.affectedRows);
                return result;
            } catch(err) {
                connection.release();
                console.log('dbinsert Query Error', err);
                return false;
            }
        } catch(err) {
            console.log('dbinsert DB Error', err);
            return false;
        }
    };

    var rows = dbTest ();

    rows.then( (row) => {

        console.log('dbTest row length ', row.length);

        if ( row.length == 0) {

            var rowsInsert = dbinsert ();

            rowsInsert.then( (rowsResult) => {

                console.log('rowsInsert rowsResult : ' , rowsResult.affectedRows);

                res.json({ result : 'SUCC'
                    , accessKey : uuid
                    , validPeriod: validPeriod
                    , serialNo : serialNo
                });

            });
        } else {
            console.log(row[0].accessKey);
            console.log(row[0].validPeriod);

            uuid = row[0].accessKey;
            validPeriod = row[0].validPeriod;
            console.log(row);

            res.json({ result : 'SUCC'
                , accessKey : uuid
                , validPeriod: validPeriod
                , serialNo : serialNo
            });
        }
    });

});

router.post('/modify', function(req, res, next) {
    var uuidV4 = require('uuid/v4');
    var moment = require('moment');
    var validPeriod = moment().add(7, 'd').format("YYYY-MM-DD HH:mm:ss");
    //var serialNo = req.query.serialNo;
    var serialNo = req.body.serialNo;
    var accessKey = req.body.accessKey;

    console.log('req.body : ', req.body);

    console.log('serialNo : ', serialNo , 'accessKey : ', accessKey);

    if ( serialNo == null || accessKey == null ) {
        res.json({ result : 'FAIL' });
        return;
    }

    const dbSelect = async () => {
        try {
            const connection = await sql.getConnection(async conn => conn);
            try {
                /* Step 3. */
                var post1  = {accessKey:accessKey, serialNo:serialNo};
                var selectsql1 = "SELECT accessKey, validPeriod FROM accessKey WHERE accessKey ='" + accessKey +"' and serialNo = '" +  serialNo +"'";

                //const [result] = await connection.query('SELECT accessKey, validPeriod FROM accessKey WHERE accessKey = ' +accessKey + );
                const [result] = await connection.query(selectsql1 );
                connection.release();
                console.log('dbTest rows', result);

                console.log('dbTest rows length', result.length);

                return result;

            } catch(err) {
                connection.release();
                console.log('dbTest Query Error : ', err);
                return false;
            }
        } catch(err) {
            console.log('dbTest DB Error : ', err);
            return false;
        }
    };

    const dbUpdate = async () => {
        try {
            const connection = await sql.getConnection(async conn => conn);
            try {

                post  = {accessKey:accessKey, serialNo:serialNo};
                var updatesql = "UPDATE accessKey SET validPeriod='" + validPeriod +"' WHERE accessKey= '" + accessKey +"' and serialNo = '" + serialNo + "'";
                const [result] = await connection.query(updatesql);
                connection.release();
                console.log('dbUpdate rows', result.affectedRows);
                return result;
            } catch(err) {
                connection.release();
                console.log('dbUpdate Query Error');
                return false;
            }
        } catch(err) {
            console.log('dbUpdate DB Error');
            return false;
        }
    };



    var rowsSelect = dbSelect ();

    rowsSelect.then( (row) => {

        if ( row.length == 0) {
            res.json({ result : 'FAIL' });
            return;
        } else {
            var rowsUpdate = dbUpdate ();

            rowsUpdate.then( (rowsResult) => {

                console.log('rowsUpdate rowsResult', rowsResult.affectedRows);

                if ( rowsResult.affectedRows ==1 ) {
                    res.json({ result : 'SUCC'
                        , accessKey : accessKey
                        , validPeriod: validPeriod
                        , serialNo : serialNo
                    });
                } else {
                    res.json({ result : 'FAIL' });
                    return;
                }

            });
        }

    });

});

router.post('/delete', function(req, res, next) {
  //res.send('respond with a resource');
  //res.send("{ \"hello\": \"world\" }");
    var serialNo = req.body.serialNo;
    var accessKey = req.body.accessKey;

    console.log('serialNo : ', serialNo);
    console.log('accessKey : ', accessKey);

    if ( serialNo == null || accessKey == null ) {
        console.log('FAIL serialNo : ', serialNo);
        console.log('FAIL accessKey : ', accessKey);
        res.json({ result : 'FAIL' });
        return;
    }

    var post  = {serialNo:serialNo, accessKey:accessKey };

    try {
        var deletesql = "DELETE FROM accessKey WHERE serialNo = '" + serialNo + "' and accessKey = '" + accessKey + "'";
        var query = sql.query(deletesql, function(err, result) {
            if (err) throw err;

            console.log('deletesql rowsResult', result);

            if ( result.affectedRows ==1 )  {
                res.json({ result : 'SUCC', serialNo : serialNo });
            } else {
                res.json({ result : 'FAIL' });
            }

        });
    } catch (e) {
        console.log('deletesql Fail' );
        res.json({ result : 'FAIL' });
        return;
    }

});

module.exports = router;
