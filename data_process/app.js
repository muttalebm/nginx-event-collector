const {Client} = require('@elastic/elasticsearch');
const {createObjectCsvWriter} = require('csv-writer');
require('dotenv').config();

const client = new Client({node: process.env.ELASTIC_HOST + ':' + process.env.ELASTIC_PORT});

// Function to fetch and process data from Elasticsearch using the Scroll API
const scrollTime = process.env.SCROLL_TIME; // Scroll time interval
const env_index = process.env.FLUENTD_INDEX_PREFFIX;

// console.log('env', process.env.ELASTIC_HOST);

async function fetchAndProcessData(date) {
    try {
        const dateParam = date || null;
        const index = generateIndex(dateParam);
        const batchSize = 1000; // Number of documents to fetch per scroll

        // Fetch and export data
        await fetchDataWithScroll(index, batchSize);

    } catch (error) {
        console.error(error);

    }
}

function generateIndex(date) {
    if (date) {
        // If a date is provided, use it to create the index
        return `${env_index}-${date}`;
    } else {
        // If no date is provided, use the current date to create the index
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
        return `${env_index}-${formattedDate}`;
    }
}
// Elastic data fetch and format
// async function fetchDataWithScroll() {
//     const currentDate = new Date();
//     console.log('currentDate', currentDate);
//     // Format the date as 'YYYYMMDD'
//     const formattedDate = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
//     console.log('formattedDate', formattedDate);
//
//     // Create the index variable
//     const index = `${env_index}-${formattedDate}`;
//     console.log('index', index);
//
//     const batchSize = process.env.BATCH_SIZE; // Number of documents to fetch per scroll
//     console.log('batchSize', batchSize);
//
//     // Fetch initial data
//     const initialResponse = await fetchInitialData(index, batchSize);
//     console.log('initialResponse', initialResponse);
//
//     // Process and export data for each date
//     const uniqueDates = getUniqueDates(initialResponse);
//     console.log('uniqueDates', uniqueDates);
//
//     for (const date of uniqueDates) {
//         const dataForDate = filterDataByDate(initialResponse, date);
//         console.log('dataForDate as date dataForDate', date, dataForDate);
//
//         let formattedEvents = await formatEvents(dataForDate);
//
//         console.log('formattedEvents as date formattedEvents', date, formattedEvents);
//
//         let headers = makeHeaders(formattedEvents[0]);
//         console.log('headers ', headers);
//
//         await exportDataToCSV(headers, formattedEvents, date);
//     }
//
//     console.log('Data exported to CSV files based on each date.');
//     return 'Data exported to CSV files based on each date.'; // Return a completion message
// }
async function fetchDataWithScroll() {
    const currentDate = new Date();
    console.log('currentDate', currentDate);

    // Format the date as 'YYYYMMDD'
    const formattedDate = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
    console.log('formattedDate', formattedDate);

    // Create the index variable
    const index = `${env_index}-${formattedDate}`;
    console.log('index', index);

    const batchSize = process.env.BATCH_SIZE; // Number of documents to fetch per scroll
    console.log('batchSize', batchSize);

    // Fetch initial data
    const initialResponse = await fetchInitialData(index, batchSize);
    console.log('initialResponse', initialResponse);

    // const dataForDate = initialResponse; // All data is for the current date

    let formattedEvents = await formatEvents(initialResponse);

    console.log('formattedEvents as date formattedEvents', formattedEvents);

    let headers = makeHeaders(formattedEvents[0]);
    console.log('headers ', headers);

    await exportDataToCSV(headers, formattedEvents, formattedDate);

    console.log('Data exported to CSV file for the current date.');
    return 'Data exported to CSV file for the current date.'; // Return a completion message
}

function makeHeaders(data)
{
    const keys = Object.keys(data);
    return keys.map(key => ({id: key, title: key.charAt(0).toUpperCase() + key.slice(1)}));
}

// Format event to create csv
async function formatEvents($data) {
    let allFormattedDate = [];
    for (let uniqueData of $data) {
        const cpUniqueData = JSON.parse(JSON.stringify(uniqueData.events));

        // let cpUniqueData = uniqueData.events
        cpUniqueData.timestamp = uniqueData['@timestamp'];
        allFormattedDate.push(cpUniqueData);
    }
    return allFormattedDate;
    // console.log(allFormattedDate);
}
async function fetchInitialData(index, batchSize) {
    try {
        const params = {
            index,
            scroll: scrollTime,
            size: batchSize,
            body: {
                query: {
                    match_all: {},
                },
                _source: ["events", "@timestamp"],
            },
        };

        let scrollResp = await client.search(params);
        const initialData = scrollResp.hits.hits.map((hit) => hit._source);

        while (scrollResp.hits.hits.length > 0) {
            scrollResp = await client.scroll({
                scroll_id: scrollResp._scroll_id,
                scroll: scrollTime,
            });
            initialData.push(...scrollResp.hits.hits.map((hit) => hit._source));
        }

        return initialData;
    } catch (error) {
        if (error.name === 'NoLivingConnectionsError') {
            // Handle Elasticsearch connection error
            throw new Error('Failed to connect to Elasticsearch. Please check your Elasticsearch server.');
        } else if (error.name === 'ResponseError' && error.statusCode === 503) {
            // Handle server shutdown or service unavailable
            throw new Error('Elasticsearch server is currently unavailable. Please try again later.');
        } else {
            // Handle other errors
            throw error;
        }
    }
}

// Function to get unique dates from the data
function getUniqueDates(data) {
    const uniqueDates = new Set();
    for (let record of data) {
        const date = record['@timestamp'].split('T')[0]; // Assuming 'timestamp' is a date field
        uniqueDates.add(date);


    }
    return Array.from(uniqueDates);
}

// Function to filter data by date
function filterDataByDate(data, date) {
    return data.filter(record => record['@timestamp'].split('T')[0] === date);
}

// Function to export data to CSV for a given date
async function exportDataToCSV(headers, data, date) {
    const csvWriter = createObjectCsvWriter({
        path: `./processed_csv/${date}_output.csv`,
        header: headers
    });

    await csvWriter.writeRecords(data);
    console.log(`Data for ${date} exported to ${date}_output.csv`);
}

// Call the function to start fetching and exporting data

fetchAndProcessData()
    .catch(error => console.error(error));

module.exports = {
    generateIndex,
    fetchDataWithScroll,
    formatEvents,
    fetchInitialData,
    getUniqueDates,
    filterDataByDate,
    exportDataToCSV
};

// module.exports = app;
