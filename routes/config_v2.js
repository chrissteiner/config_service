//all user routes oder user related routes
const express = require('express')
const config = express.Router()
var SqlString = require('sqlstring');
const database_credits = require('../_individuals/database');
const helper = require('../_config/helpers')
const jwt = require('../_config/jwt_service');
const mysql = require('mysql')
const Server_defines = require('../_individuals/API_defines')
const bodyParser = require("body-parser");
config.use(bodyParser.urlencoded({ extended: true }));
config.use(bodyParser.json());
var vOption;
//Database
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const client = new MongoClient(database_credits.mongodb.connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(function (err, db) {
    if (err) { Server_defines.database_health = false; throw err; }
    else {
        database = db.db(database_credits.mongodb.database)
        Server_defines.database_health = true;
        logger.info("MongoDB is Connected")
    }
})
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

config.get("/config_service/API/v2/healthcheck", (req, res) => {
    logger.verbose(req.hostname + req.url + " erfolgreich aufgerufen");

    logger.verbose(req.hostname + req.url + " Database health = " + Server_defines.database_health);
    if (Server_defines.database_health == true) {
        res.status(200).send(true)
    } else {
        // Server_defines.database_health
        res.status(503).send(false)
    }
})

config.post("/config_service/API/v2/getRFIDconfig", (req, res) => {
    logger.verbose(req.hostname + req.url + " erfolgreich aufgerufen");
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
        }
    })
})

config.get("/config_service/API/v2/getRFIDAccounts", (req, res) => {
    logger.verbose(req.hostname + req.url + " erfolgreich aufgerufen");
    logger.verbose(req.hostname + req.url + " %o", req.body);
    // res.status(501).send("Endpoint was moved - implementation waiting");
    // return;
    //GET Credentials
    const userid = req.body.userid; //const user_email = 'chris_steiner@me.com';

    //define SQL Query
    const queryString = SqlString.format("SELECT * FROM t_RFID_config WHERE aws_id ="+ userid + ";");
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
        }
    })
})

config.post("/config_service/API/v2/getESP32Intervall", (req, res) => {
    logger.verbose(req.hostname + req.url + " erfolgreich aufgerufen");
    logger.verbose(req.hostname + req.url + " %o", req.body);
    //GET Credentials
    const userid = req.body.userid.toString(); //const user_email = 'chris_steiner@me.com';
    if (userid != undefined) {
        //define MongoDB Query
        (async function () {
            logger.info("userID is: " + userid);
            const myquery = { userID: userid };
            const cursor = await database.collection(database_credits.mongodb.collection_config).findOne(myquery);
            logger.info("%o", cursor);
            res.status(200).send(cursor);
        }(userid));

    } else {
        logger.info("Die Parameter liegen in keiner gültigen Form vor!");
        res.status(400).send({ 'message': "Die Parameter liegen in keiner gültigen Form vor!" });
        return;
    }
})

config.put("/config_service/API/v2/updateESP32Intervall", (req, res) => {
    logger.verbose(req.hostname + req.url + " erfolgreich aufgerufen");
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
        try {
            (async function () {
                const newDocument = {
                    config_PIR_timeout_sek: aussenlicht_timeout,
                    doorOpenTime_sek: doorOpen,
                    config_Temp_Intervall_sek: temp_intervall,
                    temp_hysterese: temp_hysterese,

                };
                logger.debug("%o", newDocument);
                const cursor = await database.collection(database_credits.mongodb.collection_config).updateOne({ userID: { $eq: userid } }, { $set: newDocument });
                console.log(cursor)
                res.status(200).send(cursor);
                return;
            }(userid));
        }
        catch (e) {
            res.status(500).send({ 'message': "cannot execute API: " + e }); logger.error(req.url + "catched error500 (API didn´t break) -> %o", e);
        }

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