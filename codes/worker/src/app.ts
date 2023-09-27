import Logger from "./util/logger"
import yargs from 'yargs/yargs';
import { HourWiseReport, DayWiseReport } from "./lib/report"
import { WriteToCSV } from "./util/csvwriter"
import {DateTime} from "luxon"


const argv = yargs(process.argv.slice(2)).options({
   forDaysBefore: { type: 'number', default: 1 },
   generateHourWise: { type: "boolean", default: false }
}).parseSync();

let csv = new WriteToCSV("20230923");

const _logger = new Logger();
_logger.log("info", "Application started");

const getReport = () => {
   if (argv.generateHourWise) {
      return new HourWiseReport();
   }
   return new DayWiseReport(0);
};
const runReport = async () => {
   _logger.log("info", "Application started");

   let reportObj = getReport();

   try {
      let rs = await reportObj.fetchData(0);
      let nextScrollId = rs.body._scroll_id;
      let scroll_size = rs.body.hits.hits.length;
      await processData(rs.body.hits.hits)
      while (scroll_size > 0) {
         rs = await reportObj.scrollData(nextScrollId)
         await processData(rs.body.hits.hits)
         nextScrollId = rs.body._scroll_id;
         scroll_size = rs.body.hits.hits.length;
      }
      return true;
   } catch (err: any) {
      _logger.log("error", "Application faced error", err);
   }
}

async function processData(data: any) {
   let tempItem = []
   for (let item of data) {
      tempItem.push({
         "time": DateTime.fromISO(item.fields['@timestamp'][0]).toFormat("yyyy-LL-dd HH:mm:ss"),
         "msisdn": item.fields['events.msisdn'].toString(),
         "platform": item.fields['events.platform'],
         "version": item.fields['events.version'],
         "event": item.fields['events.event'],
         "identifier": item.fields['events.identifier'],
         "source": item.fields['events.source'],
         "user_agent": item.fields.user_agent[0],
         "http_x_real_ip": item.fields.http_x_real_ip[0],
         "referer": item.fields.referer[0],
      })
   }
   await writeToCSV(tempItem);

}
runReport().then().catch();

async function writeToCSV(item: any): Promise<void> {
   _logger.log("error", "Application writing chunk");

   return await csv.write(item);
}

