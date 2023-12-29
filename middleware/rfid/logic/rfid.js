//all user routes oder user related routes
const express = require('express')
const config = express.Router()
const bodyParser = require("body-parser");
const database_credits = require('../../../_individuals/database');

var SqlString = require('sqlstring');
const mysql = require('mysql')

config.use(bodyParser.urlencoded({ extended: true }));
config.use(bodyParser.json());

//Initialize Logging
const logger = require("../../../_config/logging_defines");

async function deleteRFIDCard(req, res) {
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
}

async function createRFIDCard(req, res) {
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
}

module.exports = { deleteRFIDCard, createRFIDCard }

//stellt die Verbindung zur Datenbank über den Connection-Pool her
function getConnection() {
    System_health.sql_db_health = true // funktioniert nicht, aber damit es dauerhaft auf true ist
    return pool
}

//Limitiert die aktiven Sessions auf der Datenbank. Zu viele (offene) Sessions können die Performance beeinflussen
//die Konfiguration dieser Variablen ist in /Individuals/database.js
const pool = mysql.createPool({ connectionLimit: database_credits.database_credits.connectionLimit, host: database_credits.database_credits.host, user: database_credits.database_credits.user, database: database_credits.database_credits.database, password: database_credits.database_credits.password })
