import winston from "winston";
import * as config from "./config";
import DailyRotateFile from "winston-daily-rotate-file";
import * as Path from "path";

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
    silly: 5
}

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
}

const level = () => {

    return process.env.NODE_ENV == "TEST" ? "silly" : config.LOG_LEVEL;
}

const format = winston.format.combine(
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss:ms'}),
    winston.format.printf(
        (info) => `${info.timestamp} [${config.APP_NAME}] [${info.level}]: ${info.message}`,
    ),
)

const consoleTransport = new winston.transports.Console()
const transports = [
    consoleTransport
]


const _logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports
})


const fileTransport = new DailyRotateFile({
    filename: config.LOG_LOCATION + Path.sep + `${config.LOG_NAME}-%DATE%.log`,
    datePattern: "YYYYMMDD",
    zippedArchive: false,
    maxSize: config.LOG_MAX_SIZE,
    maxFiles: config.LOG_MAX_KEEP,
})
if (config.LOG_WRITE_TO_FILE === true) {
    _logger.add(fileTransport)
}

if (process.env.NODE_ENV == 'TEST') {
    const testTransport = new DailyRotateFile({
        filename: config.LOG_LOCATION + Path.sep + `test-%DATE%.log`,
        datePattern: "YYYYMMDD",
        zippedArchive: false,
        maxSize: "1m",
        maxFiles: '1d',
        level: 'silly'
    })
    _logger.remove(fileTransport);
    _logger.remove(consoleTransport);
    _logger.add(testTransport)

}

export class Logger {
    log(level: string, message: string, data?: any) {
        if (data) {
            const processedMessage = message + " Context: " + JSON.stringify(data);
            _logger.log(level, `${processedMessage}`);
        } else {
            _logger.log(level, message);
        }
    }
}

export default Logger