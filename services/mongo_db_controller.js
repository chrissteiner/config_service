// const express = require('express')
// const dbController = express.Router()
const database_credits = require('../_individuals/database');
const Server_defines = require('../_individuals/API_defines');
const bodyParser = require("body-parser");
const logger = require("../_config/logging_defines");
const MongoClient = require('mongodb').MongoClient;
let ObjectId = require('mongodb').ObjectId;
//---------------------------------------------------------------------------------------------------------------------------
var database;
const client = new MongoClient(database_credits.mongodb.connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(function (err, db) {
    console.log("connecting to mongoDB...");
    if (err) {
        Server_defines.System_health.mongoDB_health = false;
        throw err;
    }
    else {
        database = db.db(database_credits.mongodb.database)
        Server_defines.System_health.mongoDB_health = true;
        logger.info("MongoDB is Connected: %o", database_credits.mongodb.collection_config)
    }
})

class dbController {
    //find One
    //---------------------------------------------------------------------------------------------------------------------------
    async getSystemConfig(userid) {
        const myquery = { 'userID': userid };
        console.debug(myquery);
        const cursor = await database.collection(database_credits.mongodb.collection_config).findOne(myquery);
        logger.debug("%o", cursor);
        return cursor;
    }
    //---------------------------------------------------------------------------------------------------------------------------
    async getDeviceConfig(deviceID) {
        const myquery = { 'deviceID': deviceID };
        const cursor = await database.collection(database_credits.mongodb.collection_config).findOne(myquery);
        logger.debug("%o", cursor);
        return cursor;
    }

    async updateSystemConfig(userid, newDocument) {
        const cursor = await database.collection(database_credits.mongodb.collection_config).updateOne({ userID: { $eq: userid } }, { $set: newDocument });
        logger.debug("%o", cursor)
        return cursor;
    }


    // find All
    //---------------------------------------------------------------------------------------------------------------------------
    // async getMassnahmen() {
    //     const cursor = database_office.collection(database_credits.mongodb.database_office.collection).find();
    //     const response = await cursor.toArray();
    //     logger.silly("%o", response)
    //     return response;
    // }
    // // InsertOne
    // //---------------------------------------------------------------------------------------------------------------------------
    // async insertMassnahme(document) {
    //     logger.silly("%o", document);
    //     const result = await database_office.collection(database_credits.mongodb.database_office.collection).insertOne(document)
    //     logger.debug("Inserted Document with ID: %o", result.insertedId)
    //     return { 'message': 'Inserted Document with ID: ' + result.insertedId };
    // }
    // //Update One
    // //---------------------------------------------------------------------------------------------------------------------------
    // async updateMassnahme(document) {
    //     // const myquery = { item: document._id };
    //     const myquery = { '_id': new ObjectId(document._id) }; // Upsert true does not work if filter is _id
    //     delete document._id; //die ID darf nicht beim $set enthalten sein, sonst kommt ein Error "id darf nicht upgedated werden mimimi"

    //     const update = { $set: document };
    //     const cursor = await database_office.collection(database_credits.mongodb.database_office.collection).replaceOne(myquery, document);
    //     logger.silly(" %o ", JSON.stringify(update))
    //     logger.debug("Updated %o ", cursor.modifiedCount + " Document")
    //     return { 'message': 'Updated ' + cursor.modifiedCount + ' item' };
    // }
}


module.exports = {

    dbController
}