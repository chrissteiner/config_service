//load our app server using express somehow..
const express =       require('express')
const app =           express()
var portscanner =     require('portscanner');
const database_credits = require('./_individuals/database');
const bodyParser =    require('body-parser')
app.use(bodyParser.urlencoded({extended: false}))
const Server_defines = require('./_individuals/API_defines')

//Initialize Logging
const logger = require("./_config/logging_defines");
const helper = require('./_config/helpers');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  // res.header("Access-Control-Allow-Origin", "http://localhost:4200"); // update to match the domain you will make the request from
  // der Header Type "Authorization" wird für Angular benötigt, damit der Bearer mitgesendet werden darf. Ob ich die anderen benötige weiß ich nicht. Kommt von Google und sollte mal geprüft werden
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if(Server_defines.database_health == false){res.status(425).send("Request came too early, startup running"); logger.info("Request came too early, startup running"); return;}
  next();
});

app.get('', (req, res) => { //aws healthcheck
    res.status(200).send(helper.getServiceName() + " - Application is up!");
});

//Change Log-Level ----------------------
app.get('/config_service/logging/:newloglevel', (req, res) => {
  if(req.params.newloglevel=="silly"||req.params.newloglevel=="debug"||req.params.newloglevel=="verbose"||req.params.newloglevel=="info"||req.params.newloglevel=="warn"||req.params.newloglevel=="error"){
    logger.transports[0].level=req.params.newloglevel
    console.log("logging changed to " + req.params.newloglevel);
    res.status(201).send("logging changed to " + req.params.newloglevel);
  }else{
    logger.error("Loglevel only can be: silly, debug, verbose, info, warn, error");
    res.status(500).send("Loglevel only can be: silly, debug, verbose, info, warn, error");
  }
});

app.get('/config_service/healthcheck', (req, res) => { //aws healthcheck
  serivicename = helper.getServiceName()
  res.status(200).send({'message':true, 'servicename' : servicename, 'comment': "Up and Running", 'supported_versions': Server_defines.supported_versions});
});

// GET servicename ----------------------
var normalizedPath = require("path").join(__dirname, "routes");
  // console.log(normalizedPath) //zeigt den Pfad an
  var servicename = normalizedPath.split("/");
  servicename = servicename[(servicename.length-2)];
  // console.log(servicename)

  // GET routes (best practise = 1 file in routes folder) ----------------------
require("fs").readdirSync(normalizedPath).forEach(function(file) {
  var regex = /.js/g; //zeigt alle .js files an (wenn mehrere files im Ordner sind funktionieren alle!)
  var regex_version = /[v][0-9]*/gm;
  if(file.match(regex)){ //nur wenn ein JS file im Ordner ist, wird das verwendet
    logger.verbose("File found: " + file) //filename
    app.use(require("./routes/" + file)); //Start Server with this file
    Server_defines.supported_versions.push(file.match(regex_version)[0])
  }
});
logger.info(helper.getServiceName() + " starting. . .")
logger.info("Print Server configuration: %o", Server_defines)
logger.info("Print Database configuration: %o", database_credits.mongodb.database, database_credits.mongodb.connectionString)

//define Port_range for service
var port_range= [];
for(var i=Server_defines.Server_Port.min_port; i<=Server_defines.Server_Port.max_port; i++){
  port_range.push(i);
}

// START SERVER ON AVAILABLE PORT ----------------------
// 127.0.0.1 is the default hostname; not required to provide
portscanner.findAPortNotInUse(port_range, Server_defines.Server_address).then(port => { //sucht freien Port
  logger.verbose(servicename + `: Port ${port} is available!`);
  var usingport = process.env.PORT || port; //AWS elastic beanstalk needs the environment port
    app.listen(usingport, () => {
    logger.info(servicename + ": Server is up an running on " + usingport)
  })
});

healthy = 300;
function System_health(){
  if(
    Server_defines.System_health.mongoDB_health == false ||
    Server_defines.System_health.api_health == false
    ){
      Server_defines.System_health.ready_for_work = false;
      if(healthy != 300){
        healthy = 300;
        clearInterval(health);
        health = setInterval(System_health, healthy); //every 3 seconds (3000 milliseconds)
      }
    }else{
      Server_defines.System_health.ready_for_work = true;
      if(healthy != 5000){
        healthy = 5000;
        clearInterval(health);
        health = setInterval(System_health, healthy); //every 3 seconds (3000 milliseconds)
      }
    }
}

var health = setInterval(System_health, healthy); //every 3 seconds (3000 milliseconds)