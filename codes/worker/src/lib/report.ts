import { Client } from '@elastic/elasticsearch'
import Logger from '../util/logger';
import * as config from "../util/config"
import {DateTime} from "luxon"

export interface ReportGenerateImpl {
    fetchData(scrollData?: number): Promise<any>
    scrollData(scroll_id?: number): Promise<any>
}

export class DayWiseReport implements ReportGenerateImpl {
    private _logger;
    private _client;
    private _startTime;
    private _endTime;
    constructor(forDaysBefore: number) {

        this._logger = new Logger();
        this._client = new Client({
            node: config.ES_URL.split(','),
            auth: {
                username: config.ES_USER || '',
                password: config.ES_PASSWORD || ''
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // this._client.diagnostic.on("request",(err,result)=>{
        //     console.log(err,result?.meta)
        // })
        // this._client.diagnostic.on("response",(err,result)=>{
        //     console.log(err,result)
        // })
        this._startTime= DateTime.now().minus({days:forDaysBefore}).startOf('day').toFormat('x');
       
        this._endTime =  DateTime.now().minus({days:forDaysBefore}).endOf('day').toFormat('x');
        this._logger.log("info", "Application started",{ st:this._startTime,et:this._endTime,dt:forDaysBefore});

    }
    async fetchData(): Promise<any> {
        return await this._client.search({
            index: config.ES_INDEX_NAME,
            scroll: config.ES_SCROLL_DURATION,
            size: 10000,
            fields: ['time', 'events.*', 'user_agent', 'referer', 'user_agent', 'http_x_real_ip'],
            "_source": false,
            body:{
                query: {
                    range: {
                        "time": {
                            gte: this._startTime,
                            lt: this._endTime
                        }
                    }
                },
                sort:{
                    "time":{order:"asc"}
                }
            }
        });
    }
    async scrollData(scroll_id: any): Promise<any> {
        return await this._client.scroll({
            scroll_id: scroll_id,
            scroll: config.ES_SCROLL_DURATION
        })
    }
}

export class HourWiseReport implements ReportGenerateImpl {
    constructor() {

    }
    scrollData(scroll_id?: number | undefined): Promise<any> {
        throw new Error("Not implemented")
    }
    fetchData(scrollData?: number | undefined): Promise<any> {
        return new Promise((resolve) => {
            return resolve('ok');
        });;
    }
}

