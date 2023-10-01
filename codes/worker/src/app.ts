// process.env.NODE_TLS_REJECT_UNAUTHORIZED="0";
import Logger from "./util/logger"
import yargs from 'yargs/yargs';
import { HourWiseReport, DayWiseReport } from "./lib/report"
import { WriteToCSV } from "./util/csvwriter"
import {DateTime} from "luxon"
import { CsvWriter } from "csv-writer/src/lib/csv-writer";


const parse = yargs(process.argv.slice(2)).options({
   forDaysBefore: { type: 'number', default: 1 },
   generateHourWise: { type: "boolean", default: false }
});

let csv:WriteToCSV;
const _logger = new Logger();
_logger.log("info", "Application started");

const getReport = (inputArgs:any) => {
   if (inputArgs.generateHourWise) {
      return new HourWiseReport();
   }
   return new DayWiseReport(inputArgs.forDaysBefore[1]);
};
const runReport = async () => {
   const inputParser:any= await parse.argv; 
   csv= new WriteToCSV(DateTime.now().minus({days:inputParser.forDaysBefore[1]}).toFormat("yyyyMMdd"));

   // process.exit();
   _logger.log("info", "Application started");

   let reportObj = getReport(inputParser);

   try {
      let rs = await reportObj.fetchData();
      let nextScrollId = rs._scroll_id;
      let scroll_size = rs.hits.hits.length;
      await processData(rs.hits.hits)
      while (scroll_size > 0) {
         rs = await reportObj.scrollData(nextScrollId)
         await processData(rs.hits.hits)
         nextScrollId = rs._scroll_id;
         scroll_size = rs.hits.hits.length;
      }
      return true;
   } catch (err: any) {
      _logger.log("error", "Application faced error", {message:err.message,file:err.file,line:err.line});
   }
}

async function processData(data: any) {
   let tempItem = []
   for (let item of data) {
      tempItem.push({
         "time": DateTime.fromISO(item.fields['time'][0]).toFormat("yyyy-LL-dd HH:mm:ss"),
         "msisdn": item.fields['events.msisdn']?.toString(),
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
   return await writeToCSV(tempItem);

}
runReport().then().catch();

async function writeToCSV(item: any): Promise<void> {
   _logger.log("info", "Application writing chunk");

   return await csv.write(item);
}

