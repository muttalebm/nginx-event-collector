import { time } from "console";
import { createObjectCsvWriter } from "csv-writer"
import { CsvWriter } from "csv-writer/src/lib/csv-writer";

export class WriteToCSV {
    private _csvWriter: any;
    constructor(date: string) {
        this._csvWriter = createObjectCsvWriter({
            path: `/usr/src/app/output/toffee_events_${date}.csv`,
            header: [
                { id: "time", title: "DATETIME" },
                { id: "msisdn", title: "MSISDN" },
                { id: "platform", title: "APP PLATFORM" },
                { id: "version", title: "APP VERSION" },
                { id: "event", title: "EVENT NAME" },
                { id: "identifier", title: "EVENT ID" },
                { id: "source", title: "EVENT SOURCE" },
                { id: "user_agent", title: "USER_AGENT" },
                { id: "http_x_real_ip", title: "IP" },
                { id: "referer", title: "REFERER" }
            ],
            alwaysQuote: true
        });
    }

    async write(data: any) {
        return await this._csvWriter.writeRecords(data);
    }
}