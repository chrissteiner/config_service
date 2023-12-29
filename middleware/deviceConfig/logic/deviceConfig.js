//all user routes oder user related routes
const express = require('express')
const config = express.Router()

const bodyParser = require("body-parser");

config.use(bodyParser.urlencoded({ extended: true }));
config.use(bodyParser.json());

const db_Access = require("../../../services/mongo_db_controller.js")
const mongo_db_service = new db_Access.dbController;

//Initialize Logging
const logger = require("../../../_config/logging_defines");


async function getDeviceConfig(req, res) {
    logger.debug(req.hostname + req.url + " %o", req.body);
    try {
        //GET Credentials
        const deviceID = req.body.deviceID.toString(); //const user_email = 'chris_steiner@me.com';
        if (deviceID != undefined) {
            //define MongoDB Query
            logger.info("userID is: " + deviceID);
            let response = await mongo_db_service.getDeviceConfig(deviceID);
            delete response._id;
            delete response.deviceID;
            res.status(200).send(response);
            logger.http(req.hostname + req.url + " Request successful");
        }
    }
    catch (e) {
        res.status(500).send({ 'message': "cannot execute API: " + e }); logger.error(req.url + " catched error500 (API didn´t break) -> %o", e);
    }
}


module.exports = { getDeviceConfig }