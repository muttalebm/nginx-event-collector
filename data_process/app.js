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

async function fetchDataWithScroll() {
    const currentDate = new Date();
// Format the date as 'YYYYMMDD'
    const formattedDate = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
// Create the index variable
    const index = `${env_index}-${formattedDate}`;

    // const index = 'fluentd-20230912';
    const batchSize = process.env.BATCH_SIZE; // Number of documents to fetch per scroll

    // Fetch initial data
    const initialResponse = await fetchInitialData(index, batchSize);

    // Process and export data for each date
    const uniqueDates = getUniqueDates(initialResponse);
    for (const date of uniqueDates) {
        const dataForDate = filterDataByDate(initialResponse, date);
        let formattedEvents = await formatEvents(dataForDate);
        let  headers = makeHeaders(formattedEvents[0]);
        await exportDataToCSV(headers, formattedEvents, date);
    }

    console.log('Data exported to CSV files based on each date.');
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

// Function to fetch the initial data from Elasticsearch
async function fetchInitialData(index, batchSize) {
    // let scrollTime;
    const params = {
        index,
        scroll: scrollTime,
        size: batchSize,
        body: {
            "query": {
                "match_all": {}
            },
            "_source": ["events", "@timestamp"]
        },
    };

    let scrollResp = await client.search(params);
    const initialData = scrollResp.hits.hits.map(hit => hit._source);

    while (scrollResp.hits.hits.length > 0) {
        scrollResp = await client.scroll({
            scroll_id: scrollResp._scroll_id,
            scroll: scrollTime,
        });
        initialData.push(...scrollResp.hits.hits.map(hit => hit._source));
    }

    return initialData;
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
