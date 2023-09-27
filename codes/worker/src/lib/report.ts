import { Client } from '@elastic/elasticsearch'
import Logger from '../util/logger';
import * as config from "../util/config"
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
            node: config.ES_URL,
            auth: {
                username: process.env.ES_USER || '',
                password: process.env.ES_PASSWORD || ''
            }
        });

        this._startTime = Date.parse(
            (new Date())
                .toISOString()
                .split('T')[0]) - (forDaysBefore * 60 * 60 * 24 * 1000);
        this._endTime = this._startTime + 86400000
        this._logger.log("info", "Application started", this._startTime);

    }
    async fetchData(): Promise<any> {
        return await this._client.search({
            index: config.ES_INDEX_NAME,
            scroll: config.ES_SCROLL_DURATION,
            size: 10,
            body: {
                fields: ['@timestamp', 'events.*', 'user_agent', 'referer', 'user_agent', 'http_x_real_ip'],
                "_source": false,
                query: {
                    range: {
                        "@timestamp": {
                            gte: this._startTime,
                            lt: this._endTime
                        }
                    }
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

