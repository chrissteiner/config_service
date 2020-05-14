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
const request = require('request');
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

config.get("/API/healthcheck", (req, res) => {
    logger.verbose(req.hostname +  req.url + " erfolgreich aufgerufen");

    logger.verbose(req.hostname +  req.url + " Database health = " + Server_defines.database_health);
    if(Server_defines.database_health==true){
        res.status(200).send(true)
    }else{
        // Server_defines.database_health
        res.status(503).send(false)  
    }
})

config.post("/API/getConfigforDevice", (req, res) => {
    logger.verbose(req.hostname +  req.url + " erfolgreich aufgerufen");
    logger.verbose(req.hostname +  req.url + " %o" , req.body );
    if(!req.body.device_id_hex){
        logger.error(req.hostname +  req.url + " Es waren notwendige Felder beim Funktionsaufruf auf 'undefined' - Abbruch ");
        res.status(428).send("Precondition Required");
    }else{
        //GET Credentials
        const device_id_hex = req.body.device_id_hex; //const user_email = 'chris_steiner@me.com';
        
        //define SQL Query
        const queryString = SqlString.format("SELECT * FROM t_config_global WHERE device_id_hex = '"+ device_id_hex +"' or device_id_hex = '00000000' ORDER BY device_id_hex DESC Limit 1");
        logger.debug(req.hostname +  req.url +" "+  queryString)

        getConnection().query(queryString, (err, rows, fields) =>{
            if(err){
                //throw error if not successful
                logger.error(req.hostname +  req.url + " Config cannot be loaded! Error: " + err)
                res.sendStatus(500);
                return;
            }else{
                logger.info(req.hostname +  req.url + " Config sent to Client with hex_id: " + device_id_hex);
                logger.debug("Got Data: %o", rows);

                const options2 = { //sub API konfigurieren
                    url: 'http://127.0.0.1:5440/API/sub/getIntervall/', secureProtocol: 'TLSv1_method', /*headers : {  "Authorization" : token},*/ 'method': 'POST', "body" : { "device_id_hex" : device_id_hex },json: true};
                    logger.info(req.hostname +  req.url + "Subquery wird aufgerufen: %o ", options2);
                request(options2, function (err, response, data, next) { //sub API aufrufen (response darf absichtlich nicht so heißen wie das "res" bei Aufruf, da es sich sonst überschreibt)
                    if(err){
                        logger.error(req.hostname +  req.url + " Failed to fetch Data" + err)
                        res.status(500).send("Failed to fetch Data"); //gleich die ganze Query abbrechen an den Client mit Error
                        return
                    }else if(response.statusCode == 500){  //if Subquery is broken
                        logger.error(req.hostname +  req.url + " Subquery is broken ("+ options2.url +")!")
                        res.status(500).send("Failed to fetch Data"); //gleich die ganze Query abbrechen an den Client mit Error
                        return
                    }else if(response.statusCode == 428){  //if Subquery is broken
                        logger.error(req.hostname +  req.url + " There is no device_id_hex ("+ options2.url +")!")
                        res.status(500).send("Failed to fetch Data"); //gleich die ganze Query abbrechen an den Client mit Error
                        return
                    }else if(response.statusCode == 200){
                        logger.debug(req.hostname +  req.url + " Got userID and intervall: %o", data); //data is only InsertID usw.. es muss nur 200 - OK zurückgegeben werden
                        // data = JSON.parse(data); //make String to JSON object

                        // data= JSON.parse(data)
                        logger.info(req.hostname +  req.url + "  Getting user_id from DB successful: %o", data[0].user_id);
                        logger.info(req.hostname +  req.url + "  Getting intervall from DB successful: %o", data[0].update_intervall_minuten);

                        let i;
                        for( i=0; i < rows.length; i++ ){
                            rows[i].intervall = ''+ data[0].update_intervall_minuten+ '';
                            rows[i].user_id = ''+ data[0].user_id+ '';
                        }
                        logger.info(req.hostname +  req.url + "%o", rows)
                        logger.info(req.hostname +  req.url + " Die Konfig wurde erstellt für Device: " + device_id_hex);
                        res.status(200).send(rows);
                        return
                    } else{
                        logger.error(req.hostname +  req.url + " Failed to fetch Data - Unknown error" + response)
                        res.status(500).send("Failed to fetch Data"); //gleich die ganze Query abbrechen an den Client mit Error
                        return
                    }
                });
            }
        })
    }
})

config.post("/API/sub/getIntervall", (req, res) => {
    logger.verbose(req.hostname +  req.url + " erfolgreich aufgerufen");
    logger.verbose(req.hostname +  req.url + " %o" , req.body );
    if(!req.body.device_id_hex){
        logger.error(req.hostname +  req.url + " Es waren notwendige Felder beim Funktionsaufruf auf 'undefined' - Abbruch ");
        res.status(428).send("Precondition Required");
    }else{
        //GET Credentials
        const device_id_hex = req.body.device_id_hex; //const user_email = 'chris_steiner@me.com';
        
        //define SQL Query
        const queryString = SqlString.format("SELECT user_id, update_intervall_minuten FROM t_config_device WHERE device_id_hex = '"+ device_id_hex +"' Limit 1;");
        logger.debug(req.hostname +  req.url +" "+  queryString)

        getConnection().query(queryString, (err, rows, fields) =>{
            if(err){
                //throw error if not successful
                logger.error(req.hostname +  req.url + " Config cannot be loaded! Error: " + err)
                res.sendStatus(500);
                return;
            }else{
                logger.info(req.hostname +  req.url + " Config sent to Client with hex_id: " + device_id_hex);
                logger.debug("Got Data: %o", rows);
                //res.json(rows)
                res.status(200).send(rows);
            }
        })
    }
})

config.post("/API/setIndividualConfig", (req, res) => {
    logger.verbose(req.hostname + req.url + " erfolgreich aufgerufen");
    if(!req.body.device_id_hex){
        logger.error(req.hostname +  req.url + " Es waren notwendige Felder beim Funktionsaufruf auf 'undefined' - Abbruch ");
        res.status(428).send("Precondition Required");
    }else{
        //logger.info("%o", req.params) 
        const device_id_hex = req.body.device_id_hex;
        if(!req.body.server_url_base_healthcheck && !req.body.server_url_base_addTemp){
            logger.info("Es wurde keine Variable verändert, Standard-Konfig bleibt für dieses Gerät: " + device_id_hex);
            res.status(204).send("Es wurde keine Variable verändert, Standard-Konfig bleibt für dieses Gerät");
            return
        }
        logger.debug("Sub Query vorbereiten");

        const options2 = { //sub API konfigurieren
            url: 'http://127.0.0.1:5440/API/getConfigforDevice/', secureProtocol: 'TLSv1_method', /*headers : {  "Authorization" : token},*/ 'method': 'POST', "body" : { "device_id_hex" : device_id_hex },json: true};
            logger.info(req.hostname +  req.url + " Subquery wird aufgerufen: %o ", options2);
        request(options2, function (err, response, rows, next) { //sub API aufrufen (response darf absichtlich nicht so heißen wie das "res" bei Aufruf, da es sich sonst überschreibt)

            if(err || !response){   logger.error(req.hostname +  req.url + " Failed to fetch Data" + err);  res.status(500).send("Failed to fetch Data"); //gleich die ganze Query abbrechen an den Client mit Error
                return
            }else if(response == "Internal Server Error"){  //if Subquery is broken
                logger.error(req.hostname +  req.url + " Subquery is broken ("+ options.url +")!");  res.status(500).send("Failed to fetch Data"); //gleich die ganze Query abbrechen an den Client mit Error
                return
            }else{
                logger.info(req.hostname +  req.url + " Subquery successful")
                var server_url_base_addTemp, server_url_base_healthcheck, queryString;
                if(rows[0].device_id_hex == '00000000'){
                    logger.info("Erstelle neue Konfiguration...");
                    if(!req.body.server_url_base_healthcheck){ server_url_base_healthcheck=rows[0].server_url_base_healthcheck}else{ server_url_base_healthcheck = req.body.server_url_base_healthcheck} //BETTER READ RECORD TYPE FROM ACTUAL DB CONFIGURATION TO GET THE "AT THE MOMENT CONFIG"
                    if(!req.body.server_url_base_addTemp){ server_url_base_addTemp=rows[0].server_url_base_addTemp}else{ server_url_base_addTemp = req.body.server_url_base_addTemp} //BETTER READ RECORD TYPE FROM ACTUAL DB CONFIGURATION TO GET THE "AT THE MOMENT CONFIG"
                    queryString = SqlString.format("INSERT INTO t_config_global (server_url_base_healthcheck, server_url_base_addTemp, device_id_hex) VALUES (?,?,?)");
                    logger.debug(req.hostname +  req.url +" "+  queryString)
                }else{
                    logger.info("Induvidual Konfig bereits vorhanden, Update Statement vorbereiten");
                    if(!req.body.server_url_base_healthcheck){ server_url_base_healthcheck=rows[0].server_url_base_healthcheck}else{ server_url_base_healthcheck = req.body.server_url_base_healthcheck} //BETTER READ RECORD TYPE FROM ACTUAL DB CONFIGURATION TO GET THE "AT THE MOMENT CONFIG"
                    if(!req.body.server_url_base_addTemp){ server_url_base_addTemp=rows[0].server_url_base_addTemp}else{ server_url_base_addTemp = req.body.server_url_base_addTemp} //BETTER READ RECORD TYPE FROM ACTUAL DB CONFIGURATION TO GET THE "AT THE MOMENT CONFIG"
                    queryString = SqlString.format("UPDATE t_config_global SET server_url_base_healthcheck = ?, server_url_base_addTemp = ? WHERE device_id_hex=?;");
                    logger.debug(req.hostname +  req.url +" "+  queryString);              
                }
                // //mysql.format escapes die Query 
                getConnection().query(queryString, [server_url_base_healthcheck , server_url_base_addTemp, device_id_hex], (err, rows, fields) =>{
                // connection.query(queryString, (err, rows, fields) =>{
                    if(err){
                        logger.error(req.hostname +  req.url + " Failed to insert data " + err)
                        res.sendStatus(500)
                        return
                    }else{
                        //Query successful
                        logger.verbose(req.hostname +  req.url + " Insert was succeccful! ");
                        //res.json(rows)
                        res.sendStatus(201);
                        return
                    }
                })
            }
        })

    }
}) 

//stellt die Verbindung zur Datenbank über den Connection-Pool her
function getConnection(){return pool}

//Limitiert die aktiven Sessions auf der Datenbank. Zu viele (offene) Sessions können die Performance beeinflussen
//die Konfiguration dieser Variablen ist in /Individuals/database.js
const pool = mysql.createPool({connectionLimit: database_credits.database_credits.connectionLimit,host: database_credits.database_credits.host,user: database_credits.database_credits.user,database: database_credits.database_credits.database,password: database_credits.database_credits.password})

module.exports = config