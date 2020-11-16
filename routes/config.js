//all user routes oder user related routes
const express =          require('express')
const config = express.Router()
var SqlString =          require('sqlstring');
const database_credits = require('../_individuals/database');
const helper =           require('../_config/helpers')
const jwt =              require('../_config/jwt_service');
const mysql =            require('mysql')
const Server_defines =   require('../_individuals/API_defines')
const bodyParser =       require("body-parser");
config.use(bodyParser.urlencoded({extended: true}));
config.use(bodyParser.json());
var vOption;
//Initialize Logging
const logger = require("../_config/logging_defines");
vOption = {
    //These variables for JWT I have to put into verify to make sure the same user is calling
    issuer: "Authorizaxtion/Resource/This server",
    subject: "iam@user.me", 
    audience: "Chrizly.at" // this should be provided by client
}  
// var fs = require('fs');
// eval(fs.readFileSync('./_individuals/logging_defines.js')+'');

config.get("/config_service/API/healthcheck", (req, res) => {
    logger.verbose(req.hostname +  req.url + " erfolgreich aufgerufen");

    logger.verbose(req.hostname +  req.url + " Database health = " + Server_defines.database_health);
    if(Server_defines.database_health==true){
        res.status(200).send(true)
    }else{
        // Server_defines.database_health
        res.status(503).send(false)  
    }
})

config.post("/config_service/API/getRFIDconfig", (req, res) => {
    logger.verbose(req.hostname +  req.url + " erfolgreich aufgerufen");
    logger.verbose(req.hostname +  req.url + " %o" , req.body );
        //GET Credentials
        const userid = req.body.userid; //const user_email = 'chris_steiner@me.com';
        
        //define SQL Query
        const queryString = SqlString.format("SELECT rfid_uid FROM t_RFID_config;");
        logger.debug(req.hostname +  req.url +" "+  queryString)

        getConnection().query(queryString, (err, rows, fields) =>{
            if(err){
                //throw error if not successful
                logger.error(req.hostname +  req.url + " Config cannot be loaded! Error: " + err)
                res.sendStatus(500);
                return;
            }else{
                logger.info(req.hostname +  req.url + " Config sent to Client with hex_id: " + userid);
                logger.debug("Got Data: %o", rows);
                logger.debug("Got Rows: %o", rows.length);
                //res.json(rows)
                res.status(200).send(rows);
            }
        })
})
//stellt die Verbindung zur Datenbank über den Connection-Pool her
function getConnection(){return pool}

//Limitiert die aktiven Sessions auf der Datenbank. Zu viele (offene) Sessions können die Performance beeinflussen
//die Konfiguration dieser Variablen ist in /Individuals/database.js
const pool = mysql.createPool({connectionLimit: database_credits.database_credits.connectionLimit,host: database_credits.database_credits.host,user: database_credits.database_credits.user,database: database_credits.database_credits.database,password: database_credits.database_credits.password})

module.exports = config