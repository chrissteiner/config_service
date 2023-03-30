module.exports = {
    /*
     ==================== API Port =====================
    */
    Server_address: '127.0.0.1',
    Server_Port: {
        min_port: 5440,
        max_port: 5440,
    },
    token_expries: "12h",
    /*
 ==================== Runtime vars =====================
*/
    System_health: {
        ready_for_work: false, // wenn einer der unteren false ist, ist auch das hier false
        sql_db_health: false,
        mongoDB_health: false,
        api_health: false
    },
    /*
     ==================== Loggin defines =====================
    */
    Console_loglevel: {
        level: 'http'
    },
    timezone: 'Europe/Vienna',
    supported_versions: []

    /*
     ==================== Runtime vars =====================
    */


}