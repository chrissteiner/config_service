var winston = require('winston');
var { createLogger, format, transports } = require('winston');
const { combine} = format;
var appRoot = require('app-root-path');
var moment = require('moment-timezone');
const Server_defines = require('../_individuals/API_defines')
const helper = require('./helpers')

const appendTimestamp = format((info, opts) => {
  if(opts.tz)
    info.timestamp = moment().tz(opts.tz).format();
  return info;
});

var options = {
  console: {
    level: Server_defines.Console_loglevel.level,
    handleExceptions: true,
    json: false,
    colorize: true,
  },
  this_service: {
    level: 'silly',
    filename: '/Users/Chris/Sites/LOG/services/'+helper.getServiceName()+'_full.log',
    handleExceptions: true,
    json: false,
    colorize: true,
    maxsize: 5242880, // 5MB
    maxFiles: 3,
  },
};

var transports = {
  console: new winston.transports.Console(options.console),
  this_service: new winston.transports.File(options.this_service),
};

const logger = winston.createLogger({
  level: 'verbose',
  format: combine(
    format.splat(),
    format.json(),
    appendTimestamp({ tz: Server_defines.timezone }),
    winston.format.ms(),
    winston.format.printf(log => {
      const msg =log.message.replace('localhost', '127.0.0.1');
      const formattedDate = log.timestamp.replace('T', ' ').replace('Z', '');
      return `[${formattedDate}] | ${log.ms} | ${log.level}: ${msg}`; 
      // return `${log.timestamp} | ${log.ms} | ${log.level}: ${log.message}`;
    })
  ),
  transports: [
    transports.console,
    transports.this_service,
  ]
});
// msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"

// const levels = { 
//   error: 0,
//   warn: 1,
//   info: 2,
//   http: 3,
//   verbose: 4,
//   debug: 5,
//   silly: 6
// };
// logger.log('info', 'test message %s', 'my string');
logger.verbose(helper.getServiceName() + "/API_base" + ' Logging is initialized');
module.exports=logger;

