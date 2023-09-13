const sinon = require('sinon');

// Mock fetchInitialData function
const fetchInitialDataMock = sinon.stub();
fetchInitialDataMock.resolves([
    {
        '@timestamp': '2023-09-13T13:08:59.000000000+06:00',
        events: {
            identifier: 'toffee_i',
            source: 'sample_event_source',
            msisdn: '01940990010',
            event: 'toffee',
            version: '1.0.0',
            platform: 'ios',
        },
    },
    {
        '@timestamp': '2023-09-13T13:09:02.000000000+06:00',
        events: {
            identifier: 'toffee_i',
            source: 'sample_event_source',
            msisdn: '01940990010',
            event: 'toffee',
            version: '1.0.0',
            platform: 'ios',
        },
    },
]);


// Mock formatEvents function
const formatEventsMock = sinon.stub();
formatEventsMock.withArgs([
    {
        '@timestamp': '2023-09-13T13:08:59.000000000+06:00',
        events: {
            identifier: 'toffee_i',
            source: 'sample_event_source',
            msisdn: '01940990010',
            event: 'toffee',
            version: '1.0.0',
            platform: 'ios',
        },
    },
    {
        '@timestamp': '2023-09-13T13:09:02.000000000+06:00',
        events: {
            identifier: 'toffee_i',
            source: 'sample_event_source',
            msisdn: '01940990010',
            event: 'toffee',
            version: '1.0.0',
            platform: 'ios',
        },
    },
]).returns([
    {
        identifier: 'toffee_i',
        source: 'sample_event_source',
        msisdn: '01940990010',
        event: 'toffee',
        version: '1.0.0',
        platform: 'ios',
        timestamp: '2023-09-13T13:08:59.000000000+06:00',
    },
    {
        identifier: 'toffee_i',
        source: 'sample_event_source',
        msisdn: '01940990010',
        event: 'toffee',
        version: '1.0.0',
        platform: 'ios',
        timestamp: '2023-09-13T13:09:02.000000000+06:00',
    },
]);

// Mock exportDataToCSV function
const exportDataToCSVMock = sinon.stub();
exportDataToCSVMock.withArgs(
    [
        { id: 'identifier', title: 'Identifier' },
        { id: 'source', title: 'Source' },
        { id: 'msisdn', title: 'Msisdn' },
        { id: 'event', title: 'Event' },
        { id: 'version', title: 'Version' },
        { id: 'platform', title: 'Platform' },
        { id: 'timestamp', title: 'Timestamp' },
    ],
    [
        {
            identifier: 'toffee_i',
            source: 'sample_event_source',
            msisdn: '01940990010',
            event: 'toffee',
            version: '1.0.0',
            platform: 'ios',
            timestamp: '2023-09-13T13:08:59.000000000+06:00',
        },
        {
            identifier: 'toffee_i',
            source: 'sample_event_source',
            msisdn: '01940990010',
            event: 'toffee',
            version: '1.0.0',
            platform: 'ios',
            timestamp: '2023-09-13T13:09:02.000000000+06:00',
        },
    ],
    '2023-09-13'
).resolves();

// Mock makeHeaders function
const makeHeadersMock = sinon.stub();
makeHeadersMock.withArgs([
    'identifier',
    'source',
    'msisdn',
    'event',
    'version',
    'platform',
    'timestamp',
]).returns([
    { id: 'identifier', title: 'Identifier' },
    { id: 'source', title: 'Source' },
    { id: 'msisdn', title: 'Msisdn' },
    { id: 'event', title: 'Event' },
    { id: 'version', title: 'Version' },
    { id: 'platform', title: 'Platform' },
    { id: 'timestamp', title: 'Timestamp' },
]);

module.exports = {
    fetchInitialDataMock,
    formatEventsMock,
    exportDataToCSVMock,
    makeHeadersMock,
};
