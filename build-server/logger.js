import winston from 'winston'
import Transport from 'winston-transport'
const loggerConfig = {
    level: winston.config.syslog.levels,
    format: winston.format.simple(),
    // defaultMeta: { service: 'build-server' },
    transports: [
      new winston.transports.Console({
        level: 'info',
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
      new winston.transports.Console({
        level: 'error',
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
    ],
    exceptionHandlers: [
      new winston.transports.File({ filename: './log/exceptions.log' })
    ]
}

export const logger = winston.createLogger(loggerConfig);


export const StringLogger = () => {
    const stringTransport =  new StringTransport()
    const {...loggerConfig} = {
        transports: [
            stringTransport
          ],
    }
    const logger =  winston.createLogger(loggerConfig)
    if (process.env.NODE_ENV !== 'production') {
        logger.add(new winston.transports.Console({
          format: winston.format.simple(),
        }));
    }
    return [logger, stringTransport]
}

export class StringTransport extends Transport {
    constructor(opts) {
      super(opts);
      this.logString = '';
    }
  
    log(info, callback) {
      // Collect log messages as strings
      this.logString += `${info.level}: ${info.message}`;
      callback();
    }
  
    // Expose logString
    getLogString() {
      return this.logString;
    }
  }

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}