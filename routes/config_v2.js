//all user routes oder user related routes
const express = require('express')
const config = express.Router()
const database_credits = require('../_individuals/database');
const helper = require('../_config/helpers')
const bodyParser = require("body-parser");

var SqlString = require('sqlstring');
const mysql = require('mysql')

config.use(bodyParser.urlencoded({ extended: true }));
config.use(bodyParser.json());
const Server_defines = require('../_individuals/API_defines')
var vOption;
//Database
const db_Access = require("../services/mongo_db_controller.js")
const mongo_db_service = new db_Access.dbController;

//Initialize Logging
const logger = require("../_config/logging_defines");
const { response } = require('express');
vOption = {
    //These variables for JWT I have to put into verify to make sure the same user is calling
    issuer: "Authorizaxtion/Resource/This server",
    subject: "iam@user.me",
    audience: "Chrizly.at" // this should be provided by client
}
// var fs = require('fs');
// eval(fs.readFileSync('./_individuals/logging_defines.js')+'');

config.post("/config_service/API/v2/getRFIDconfig", (req, res) => {
    logger.http(req.hostname + req.url + " erfolgreich aufgerufen");
    logger.verbose(req.hostname + req.url + " %o", req.body);
    // res.status(501).send("Endpoint was moved - implementation waiting");
    // return;
    //GET Credentials
    const userid = req.body.userid; //const user_email = 'chris_steiner@me.com';

    //define SQL Query
    const queryString = SqlString.format("SELECT rfid_uid FROM t_RFID_config;");
    logger.debug(req.hostname + req.url + " " + queryString)

    getConnection().query(queryString, (err, rows, fields) => {
        if (err) {
            //throw error if not successful
            logger.error(req.hostname + req.url + " Config cannot be loaded! Error: " + err)
            res.sendStatus(500);
            return;
        } else {
            logger.info(req.hostname + req.url + " Config sent to Client with hex_id: " + userid);
            logger.debug("Got Data: %o", rows);
            logger.debug("Got Rows: %o", rows.length);
            //res.json(rows)
            res.status(200).send(rows);
            logger.http(req.hostname + req.url + " Request successful");
        }
    })
})

config.get("/config_service/API/v2/getRFIDAccounts", (req, res) => {
    logger.http(req.hostname + req.url + " erfolgreich aufgerufen");
    logger.verbose(req.hostname + req.url + " %o", req.query);
    // res.status(501).send("Endpoint was moved - implementation waiting");
    // return;
    //GET Credentials
    const userid = req.query.userid; //const user_email = 'chris_steiner@me.com';

    //define SQL Query
    const queryString = SqlString.format("SELECT * FROM t_RFID_config WHERE aws_id =" + userid + ";");
    logger.debug(req.hostname + req.url + " " + queryString)

    getConnection().query(queryString, (err, rows, fields) => {
        if (err) {
            //throw error if not successful
            logger.error(req.hostname + req.url + " Config cannot be loaded! Error: " + err)
            res.sendStatus(500);
            return;
        } else {
            logger.info(req.hostname + req.url + " Config sent to Client with hex_id: " + userid);
            logger.debug("Got Data: %o", rows);
            logger.debug("Got Rows: %o", rows.length);
            //res.json(rows)
            res.status(200).send(rows);
            logger.http(req.hostname + req.url + " Request successful");
        }
    })
})
config.post("/config_service/API/v2/getESP32Intervall", (req, res) => {
    logger.http(req.hostname + req.url + " erfolgreich aufgerufen");
    logger.debug(req.hostname + req.url + " %o", req.body);
    //GET Credentials
    (async () => {
        try {
            //GET Credentials
            const userid = req.body.userid.toString(); //const user_email = 'chris_steiner@me.com';
            if (userid != undefined) {
                //define MongoDB Query
                logger.info("userID is: " + userid);
                let response = await mongo_db_service.getSystemConfig(userid);
                res.status(200).send(response);
                logger.http(req.hostname + req.url + " Request successful");
            }
        }
        catch (e) {
            res.status(500).send({ 'message': "cannot execute API: " + e }); logger.error(req.url + " catched error500 (API didn´t break) -> %o", e);
        }
    })();
})

config.post("/config_service/API/v2/systemIntervall", (req, res) => {
    logger.http(req.hostname + req.url + " erfolgreich aufgerufen");
    logger.debug(req.hostname + req.url + " %o", req.body);
    (async () => {
        try {
            //GET Credentials
            const userid = req.body.userid.toString();
            if (userid != undefined) {
                //define MongoDB Query
                logger.info("userID is: " + userid);
                let response = await mongo_db_service.getSystemConfig(userid);
                res.status(200).send(response);
                logger.http(req.hostname + req.url + " Request successful");
            }else{
                res.status(400).send("UserID is missing");
                logger.error(req.hostname + req.url + " Request failed");
            }
        }
        catch (e) {
            res.status(500).send({ 'message': "cannot execute API: " + e }); logger.error(req.url + " catched error500 (API didn´t break) -> %o", e);
        }
    })();
})

config.post("/config_service/API/v2/deviceConfig", (req, res) => {
    logger.http(req.hostname + req.url + " erfolgreich aufgerufen");
    logger.debug(req.hostname + req.url + " %o", req.body);
    (async () => {
        try {
            //GET Credentials
            const deviceID = req.body.deviceID.toString(); //const user_email = 'chris_steiner@me.com';
            if (deviceID != undefined) {
                //define MongoDB Query
                logger.info("userID is: " + deviceID);
                let response = await mongo_db_service.getDeviceConfig(deviceID);
                res.status(200).send(response);
                logger.http(req.hostname + req.url + " Request successful");
            }
        }
        catch (e) {
            res.status(500).send({ 'message': "cannot execute API: " + e }); logger.error(req.url + " catched error500 (API didn´t break) -> %o", e);
        }
    })();
})

config.post("/config_service/API/v2/createRFIDCard", (req, res) => {
    logger.http(req.hostname + req.url + " erfolgreich aufgerufen");
    logger.verbose(req.hostname + req.url + " %o", req.body);
    //GET Credentials
    const benutzername = req.body.benutzername.toString(); //const user_email = 'chris_steiner@me.com';
    const rfid_uid = req.body.rfid_UID.toString(); //const user_email = 'chris_steiner@me.com';
    const aws_id = req.body.aws_id.toString(); //const user_email = 'chris_steiner@me.com';
    if (benutzername != '' && rfid_uid != undefined && aws_id != undefined) {

        const queryString = SqlString.format("Select * FROM t_RFID_config WHERE rfid_uid = '" + rfid_uid + "';");
        logger.debug(req.hostname + req.url + " " + queryString)

        getConnection().query(queryString, (err, rows, fields) => {
            if (err) {
                //throw error if not successful
                logger.error(req.hostname + req.url + " Error in DB communication!: " + err)
                res.sendStatus(500);
                return;
            } else {
                if (rows.length > 0) {
                    res.status(400).send("Die Karte mit der ID wurde bereits für " + rows[0].benutzername + " verwendet");
                    logger.error("Die Karte mit der ID wurde bereits für " + rows[0].benutzername + " verwendet");
                    return;
                } else {
                    const queryString = SqlString.format("INSERT INTO t_RFID_config (benutzername, rfid_uid, aws_id) VALUES('" + benutzername + "','" + rfid_uid + "','" + aws_id + "');");
                    logger.debug(req.hostname + req.url + " " + queryString)

                    getConnection().query(queryString, (err, rows, fields) => {
                        if (err) {
                            //throw error if not successful
                            logger.error(req.hostname + req.url + " Insert cannot be done! Error: " + err)
                            res.sendStatus(500);
                            return;
                        } else {
                            logger.info(req.hostname + req.url + " New Card created: " + rfid_uid);
                            logger.debug("Got Data: %o", rows);
                            logger.debug("Got Rows: %o", rows.length);
                            //res.json(rows)
                            res.status(200).send(rows);
                            logger.http(req.hostname + req.url + " Request successful");
                        }
                    })
                }
            }
        })

    } else {
        res.status(500).send("Die Daten liegen in keiner gültigen Form vor");
        logger.error("Die Daten liegen in keiner gültigen Form vor");
    }
})

config.delete("/config_service/API/v2/deleteRFIDCard", (req, res) => {
    logger.http(req.hostname + req.url + " erfolgreich aufgerufen");
    logger.verbose(req.hostname + req.url + " %o", req.query);
    //GET Credentials
    const row_id = parseInt(req.query.row_id); //const user_email = 'chris_steiner@me.com';
    if (row_id != undefined) {
        //define MongoDB Query
        const queryString = SqlString.format("DELETE FROM t_RFID_config where id =" + row_id + ";");
        logger.debug(req.hostname + req.url + " " + queryString)

        getConnection().query(queryString, (err, rows, fields) => {
            if (err) {
                //throw error if not successful
                logger.error(req.hostname + req.url + " Delete cannot be done! Error: " + err)
                res.sendStatus(500);
                return;
            } else {
                logger.info(req.hostname + req.url + " Card deleted: " + row_id);
                logger.debug("Got Data: %o", rows);
                logger.debug("Got Rows: %o", rows.length);
                //res.json(rows)
                res.status(200).send(rows);
                logger.http(req.hostname + req.url + " Request successful");
            }
        })

    } else {
        res.status(500).send("Card ID liegt in keiner gültigen Form vor");
        logger.error("Card ID liegt in keiner gültigen Form vor");
    }
})

config.put("/config_service/API/v2/updateESP32Intervall", (req, res) => {
    logger.http(req.hostname + req.url + " erfolgreich aufgerufen");
    // res.status(501).send("Endpoint was moved - implementation waiting");
    // return;
    // logger.verbose(req.hostname + req.url + " %o", req.body);
    logger.debug("%o", req.body);
    //GET Credentials
    const userid = req.body.userid.toString(); //const user_email = 'chris_steiner@me.com';
    const aussenlicht_timeout = parseInt(req.body.config_PIR_timeout_sek)
    const doorOpen = parseInt(req.body.doorOpenTime_sek);
    const temp_intervall = parseInt(req.body.config_Temp_Intervall_sek);
    const temp_hysterese = parseInt(req.body.temp_hysterese);

    if (aussenlicht_timeout > 10 && doorOpen >= 1 && temp_intervall > 59 && temp_hysterese >= 0 && userid != undefined) {
        (async () => {
            try {
                //GET Credentials
                const deviceID = req.body.deviceID.toString(); //const user_email = 'chris_steiner@me.com';

                const newDocument = {
                    config_PIR_timeout_sek: aussenlicht_timeout,
                    doorOpenTime_sek: doorOpen,
                    config_Temp_Intervall_sek: temp_intervall,
                    temp_hysterese: temp_hysterese,

                };
                logger.debug("%o", newDocument);
                //define MongoDB Query
                logger.info("userID is: " + deviceID);
                response = await mongo_db_service.getDeviceConfig(deviceID, newDocument);
                res.status(200).send(response);
                logger.http(req.hostname + req.url + " Request successful");
            }

            catch (e) {
                res.status(500).send({ 'message': "cannot execute API: " + e }); logger.error(req.url + " catched error500 (API didn´t break) -> %o", e);
            }
        })
    } else {
        logger.error("Die Parameter liegen in keiner gültigen Form vor! -- Abbruch")
        res.status(400).send({ 'message': "Die Parameter liegen in keiner gültigen Form vor!" });
        return;
    }
})

//stellt die Verbindung zur Datenbank über den Connection-Pool her
function getConnection() { return pool }

//Limitiert die aktiven Sessions auf der Datenbank. Zu viele (offene) Sessions können die Performance beeinflussen
//die Konfiguration dieser Variablen ist in /Individuals/database.js
const pool = mysql.createPool({ connectionLimit: database_credits.database_credits.connectionLimit, host: database_credits.database_credits.host, user: database_credits.database_credits.user, database: database_credits.database_credits.database, password: database_credits.database_credits.password })

module.exports = config