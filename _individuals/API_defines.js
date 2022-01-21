module.exports = {
    /*
     ==================== API Port =====================
    */
    Server_address:'127.0.0.1',
    Server_Port:  {
        min_port:5440,
        max_port:5440,  
    },
    token_expries: "12h",
    /*
     ==================== Loggin defines =====================
    */
    Console_loglevel:  {
        level:'http'        
    },
    timezone: 'Europe/Vienna',

    /*
     ==================== Runtime vars =====================
    */    
   database_health: false, //wird zur Laufzeit überschrieben


}