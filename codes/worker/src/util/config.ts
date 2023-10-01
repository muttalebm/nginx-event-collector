import * as dotenv from "dotenv";

dotenv.config();

export const APP_NAME = process.env.APP_NAME || "my application";
export const APP_ENV = process.env.APP_ENV || 'DEVELOPMENT';
export const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';
export const LOG_LOCATION = process.env.LOG_LOCATION || "logs/";
export const LOG_MAX_KEEP = process.env.LOG_MAX_KEEP || "30d";
export const LOG_MAX_SIZE = process.env.LOG_MAX_SIZE || "20m";
export const LOG_WRITE_TO_FILE:boolean = process.env.LOG_WRITE_TO_FILE=="true" || false;
export const LOG_NAME = process.env.LOG_NAME 
export const ES_URL:string=process.env.ES_URL || 'http://localhost:9200';
export const ES_USER:string=process.env.ES_USER || 'elastic';
export const ES_PASSWORD:string =process.env.ES_PASSWORD ||'default@123';
export const ES_INDEX_NAME:string=process.env.ES_INDEX||'fluentd-*'
export const ES_SCROLL_DURATION:string=process.env.ES_SCROLL_DURATION||'30s'