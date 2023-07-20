var express = require('express');
var router = express.Router();
var db = require('../database');
var bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
var randtoken = require('rand-token');
const saltRounds = 10;
var found = 0;
const crypto = require ("crypto");

var global_user_uniqueid;
var global_user_email;
var admin_global_email;

router.get('/', function (req, res, next) {
    res.render('home', { title: 'Express' });
});

router.get('/about', function (req, res, next) {
    res.render('about');

});

router.get('/help', function (req, res, next) {
    res.render('help');

});
router.get('/adminForgotPassword', function (req, res, next) {
    res.render('adminForgotPassword',{msg: "", success: ""});
});

router.get('/adminLogin', function(req,res,next){
    res.render('adminLogin',{msg: "", success: ""});
});

router.get('/userLogin', function(req,res,next){
    res.render('userLogin',{msg: "", success: ""});
});

router.get('/userRegister', function(req,res,next){
    res.render('userRegister');
});

router.get('/userLogin', function(req, res, next){
    res.render('userLogin');
});

router.get('/userForgotPassword', function(req, res, next){
    res.render('userForgotPassword',{msg: "", success: ""});
});

router.get('/forgotSecretCode', function(req, res, next){
    res.render('forgotSecretCode', {msg: "", success: ""});
});

router.get('/uniqueId_card',function(req,res,next){
    res.render('uniqueId_card',{uniqueid:"", name: ""});
});

router.get('/successDownload', function(req,res,next){
    res.render('successDownload');
});

router.get('/adminPostLogin', function(req, res, next){
    res.render('adminPostLogin',{msg: "", success: ""});
});

router.get('/userInfo', function(req, res, next){
    res.render('userInfo', {userData: ""});
});


router.get('/userPostLogin', function(req, res, nexr){
    res.render('userPostLogin', {name: ""});
});


router.get('/bookFlight', function(req, res, next){
    res.render('bookFlight',{msg:""});
});

router.get('/editInfo', function(req, res, next){
    res.render('editInfo');
});


router.get('/viewFlight', function(req, res, next){
    var sql_query = `SELECT from_loc, to_loc, ddate, adate, trip FROM Flight WHERE uniqueid = "${global_user_uniqueid}"`;
    db.query(sql_query, function(err, data, fields){
        if(err) throw err;
        console.log("result: "+data);
        res.render('viewFlight', {title: 'Your Trips', userData: data});
    });
});

router.post('/successDownload', function(req, res, next){
    res.render('successDownload');
});

router.post('/adminLogin', function(req, res, next){
    var adminId = req.body.adminid;
    var password = req.body.passwordd;
    console.log("admin id nd passwordd = "+adminId+" "+password);
    var query = `SELECT password FROM adminInfo WHERE adminID = "${adminId}"`;
    db.query(query, (err,rows) => {
        if(err) throw err;
        if(rows.length == 1){
            const db_password = rows[0].password;
            if(db_password == password)
            {
                console.log("Admin Register Successfull....!");
                res.render('adminPostLogin', {msg: "", success:"Admin logins successfully"});
            }
            else{
                console.log("Error in password....!");
                res.render('adminLogin', {msg: "Password Mismatch", success : ""});
            }
        }
        else{
            console.log("Invalid Login......!");
            res.render('adminLogin', {msg:"Invalid Login", success: ""});
        }
    });
});


router.post('/adminPostLogin', function(req, res, next){
    var user_uid = req.body.uniqueid;
    var user_email = req.body.email;
    var user_pass = req.body.passwordd;
    var search_query = `SELECT * FROM userData WHERE email = "${user_email}"`;
    admin_global_email = user_email;
    db.query(search_query, (err, rows) => {
        if(err) throw err;
        if(rows.length == 1){
            const db_uid = rows[0].uniqueid;
            const db_pass = rows[0].passwordd;
            bcrypt.compare(user_uid, db_uid, (err, data) => {
                if(data)
                {
                    if(db_pass == user_pass)
                    {
                        console.log("Password Matched Successfully!");
                        res.render('userInfo', {userData: rows});
                    }
                    else{
                        console.log("Password Mismatch!");
                        res.render('adminPostLogin', {msg: "Password Mismatch!" , success:""});
                    }
                }
                else{
                    res.render('adminPostLogin', {msg: "Unique ID Mismatch!" , success:""});
                }
            });
        }
        else{
            res.render('adminPostLogin', {msg: "Email Doesn't Exist!" , success:""});
        }
    });
});

router.post('/userInfo', function(req, res, next){
    var sql_get = `SELECT * FROM userData WHERE email = "${admin_global_email}"`
    db.query(sql_get, (err, data) => {
        if(err) throw err;
        if(data.length == 1){
            res.render('editInfo',{userData: data});
        }
        else{
            console.log("More rows found!....");
            res.render('home');
        }
    });
});

router.post('/editInfo', function(req, res, next){
    const userDetails = req.body;
    var update_query = `UPDATE userData SET birth = ?, first_name = ?, last_name = ?, father_name = ?, mother_name = ?, mobile =?, gender = ?, marital = ?, employment = ?, stateSel = ?, districtSel = ?, address = ?, pincode = ?`;
    const update = [userDetails.birth, userDetails.first_name, userDetails.last_name, userDetails.father_name, userDetails.mother_name, userDetails.mobile, userDetails.gender, userDetails.marital, userDetails.employment, userDetails.stateSel, userDetails.districtSel, userDetails.address, userDetails.pincode];
    db.query(update_query, update, function(err, result){
        if(err) throw err;
        console.log("Updated Successfully!");

        var check_query = `SELECT * FROM userData WHERE email = "${admin_global_email}"`;
        db.query(check_query, (err, data) => {
            if(data.length == 1)
            {
                res.render('userInfo',{userData:data});
            }
        })
    })
});


router.post('/adminForgotPassword', function(req, res, next){
    const user_email = req.body.email;
    const user_id = req.body.unique;
    var db_password;
    var query = `SELECT uniqueid, passwordd FROM adminData WHERE email = "${user_email}"`;

    db.query(query, (err, rows) => {
        if(err) throw err;
        
        var token = randtoken.generate(20);
        console.log("Expiration "+expireDtae);
        var date;
        date = new Date();
        date = date.getUTCFullYear() + '-' +
            ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
            ('00' + date.getUTCDate()).slice(-2) + ' ' + 
            ('00' + date.getUTCHours()).slice(-2) + ':' + 
            ('00' + date.getUTCMinutes()).slice(-2) + ':' + 
            ('00' + date.getUTCSeconds()).slice(-2);

        var qry = `UPDATE adminInfo SET  expiration = "${date}" , token = "${salt}" WHERE email = "${user_email}" `;
        db.query(qry, (err, rows) => {
            if(err) throw err;
        });

        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: '...email...', // generated ethereal user
              pass: '...password...', // generated ethereal password
              
            },
            tls:{
                rejectUnauthorized:false
            }
        });

//        let mailOptions = {
//            from : '"Unique ID MS" <bindukilari77@gmail.com>',
//            to: user_email,
//            subject: 'Forgot Password',
//            text: 'To reset your password, please click the link below.\n\nhttps://'+process.env.DOMAIN+'/user/reset-password?token='+encodeURIComponent(salt)+'&email='+user_email,
//
//        };

//        transporter.sendMail(mailOptions, (error, info) => {
//            if (error) throw error;
//            console.log("Mail Sent Sucessfully...");
//            res.render('adminForgotPassword', {msg:'Email has been sent. Check your mail'});
//        });
//    });

    res.render('userLogin');

});


router.post('/user/Register', function(req, res, next){
    const userDetails = req.body;
    var insert_query = 'INSERT INTO userData SET ?';
    db.query(insert_query, userDetails, function(err, result){
        if(err) throw err;
        console.log("User Detsils inserted Sucessfully!...");
    })


    const estate = req.body.stateSel;
    const edistrict = req.body.districtSel;
    const ebirth = req.body.birth;
    let x1 = Math.floor((Math.random() * 10000) + 1);
    let x2 = Math.floor((Math.random() * 100) + 1);
    const guniqueid_user = edistrict.slice(0,2).toUpperCase() + estate.substring(0,2).toUpperCase() + x1.toString() + ebirth.substring(4,6) + x2.toString();

    var sql = 'SELECT last_insert_id() as Id';

    db.query(sql, (err, rows) => {
        if(err) throw err;
        var last_index = rows[0].Id;
        bcrypt.hash(guniqueid_user,10,function(err, hash){
            var sql = 'UPDATE userData SET uniqueid = ?  where Id = ?';
            const data = [hash,last_index];
            db.query(sql,data, function(err,result){
                if(err) throw err;
                console.log("UniueID added sucessfully");
            });
        });
        
    });
    const full_name = req.body.first_name + " " + req.body.last_name;
    
    res.render('uniqueId_card',{ name: req.body.first_name, dob: req.body.dob, gender: req.body.gender, uniqueid:guniqueid_user });
    
});

router.post('/userLogin', function(req, res, next){
    const user_uid = req.body.uniqueid;
    const user_email = req.body.email;
    const user_password = req.body.passwordd;
    global_user_uniqueid = user_uid;
    global_user_email = user_email;
    var query = `SELECT first_name, uniqueid, passwordd FROM userData WHERE email = "${user_email}"`;
    db.query(query, (err, rows) => {
        if(err) throw err;

        if(rows.length == 1){
            const db_uid = rows[0].uniqueid;
            const db_password = rows[0].passwordd;
            const db_name = rows[0].first_name;
            bcrypt.compare(user_uid, db_uid, (err,data) => {
                if(data){
                    if(db_password == user_password){
                        console.log("Login Successfully....!");
                        res.render('userPostLogin', {name: db_name});
                    }
                    else{
                        console.log("Error in Password....!");
                        res.render('userLogin',{msg: "Password Mismatch", success: ""})
                    }
                }
                else{
                    console.log("UniqueID Mismacth");
                    res.render('userLogin',{msg: "UniqueID Mismatch", success: ""})
                }
            });
        }
        else{
            console.log("Email doesn't exist");
            res.render('userLogin',{msg: "Email doesn't exit", success: ""});
        }
    });

});

router.post('/user/forgotPassword', function(req, res, next){
    const user_uid = req.body.unique;
    const user_email = req.body.email;
    const new_pass = req.body.passwordd;
    const conf_pass = req.body.confpasswordd;
    const secret_code = req.body.secret_code;
    if(new_pass == conf_pass){
        var query = `SELECT uniqueid, secret_code FROM userData WHERE email = "${user_email}"`;
        db.query(query, (err, rows) => {
            if(err) throw err;
            if(rows.length == 1){
                const db_uid = rows[0].uniqueid;
                bcrypt.compare(user_uid, db_uid, (err,data) => {
                    if(data){
                        var update = `UPDATE userData SET passwordd = "${new_pass}" WHERE email = "${user_email}"`;
                        db.query(update, (err, rows) => {
                            if(err) throw err;
                            console.log("After update rows = "+rows);
                            res.render('userLogin' , {msg:"", success: "Password Changed Sucessfully.. You can Login Now"});
                        });
                    }
                    else{
                        console.log("UniqueID Mismacth");
                        res.render('userForgotPassword',{msg: "UniqueID Mismatch"});
                    }
                });
            }
            else{
                console.log("Invalid Email!...");
                res.render('userForgotPassword', {msg: "Invalid Email"});
            }
        });
    }
    else{
        console.log("Both passwords must be same...!");
        res.render('userForgotPassword', {msg: "Both Passwords must be same"});
    }
    
});

router.post('/forgotSecretCode', function(req, res, next){
    const user_email = req.body.email;
    var query = `SELECT secret_hint FROM userData WHERE email = "${user_email}"`;
    db.query(query, (err, rows) => {
        if(err) throw err;
        if(rows.length == 1){
            var db_secret = rows[0].secret_hint;
            console.log("Secret Code: "+db_secret);
            const output = `
                <h3>You have requested for Secret Code Hint.</h3>
                <ul>
                    <li>Email entered: ${user_email}</li>
                    <li>Your Secret Code Hint is : ${db_secret}</li>
                    <li>If it is not requested by you, Please Ignore the mail.</li>
                <ul>
            `;
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                  user: 'bindukilari77@gmail.com', // generated ethereal user
                  pass: 'srbbivzywnfyyebc', // generated ethereal password
                  //pass: 'bindu2112',
                },
                tls:{
                    rejectUnauthorized:false
                }
            });

            let mailOptions = {
                from : '"Unique ID MS" <bindukilari77@gmail.com>',
                to: user_email,
                subject: 'Secret Code Hint',
                html : output
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) throw error;
                console.log("Mail Sent Sucessfully...");
                res.render('forgotSecretCode', {msg:"", success: "Email has been sent. Check your mail"});
            });

        }
        else{
            console.log("invalid mail.....!");
            res.render('forgotSecretCode', {msg:"Invalid Emaill..", success:""});
        }
        

    });
});


router.post('/bookFlight', function(req, res, next){
    const from_loc = req.body.from;
    const to_loc = req.body.to;
    const depature = req.body.ddate;
    const arrival = req.body.adate;
    const trip = req.body.trip;
    const ticketDetails = req.body;
    var flight_query = `INSERT INTO Flight (uniqueid, email, from_loc, to_loc, ddate, adate, trip) VALUES (?,?,?,?,?,?,?);`;

    db.query(flight_query, [global_user_uniqueid, global_user_email, from_loc, to_loc, depature, arrival, trip], function(err, result){
        if(err) throw err;
        console.log("Ticket Insertion Successfully!...");
        res.render('bookFlight', {msg: "Ticket Booked Successfully"});
    });

});
module.exports = router;
