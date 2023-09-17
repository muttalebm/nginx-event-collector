const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const sinon = require('sinon');

const {
    generateIndex,
    fetchDataWithScroll,
    formatEvents,
    fetchInitialData,
    exportDataToCSV
} = require('./app'); // Update the path to your script file

const {
    fetchInitialDataMock,
    formatEventsMock,
    exportDataToCSVMock,
    makeHeadersMock,
} = require('./mocks/mocks');

describe('fetchDataWithScroll', () => {
    it('should fetch and process data for a specific date', async () => {
        // Mock data for each function
        const mockInitialData = [
            {
                '@timestamp': '2023-09-12T13:00:00.000Z',
                events: {
                    identifier: '123',
                    source: 'source1',
                    msisdn: '1234567890',
                    event: 'event1',
                    version: '1.0',
                    platform: 'ios',
                },
            },
            {
                '@timestamp': '2023-09-12T14:00:00.000Z',
                events: {
                    identifier: '456',
                    source: 'source2',
                    msisdn: '9876543210',
                    event: 'event2',
                    version: '2.0',
                    platform: 'android',
                },
            },
        ];

        const mockHeaders=    ['timestamp', 'msisdn', 'identifier', 'source', 'event', 'version', 'platform'];

        // Mock the behavior of fetchInitialData function
        fetchInitialDataMock.withArgs('fluentd-20230912', 1000).resolves(mockInitialData);

        // Mock the behavior of formatEvents function
        const mockFormattedEvents = [
            {
                identifier: '123',
                source: 'source1',
                msisdn: '1234567890',
                event: 'event1',
                version: '1.0',
                platform: 'ios',
                timestamp: '2023-09-12T13:00:00.000Z',
            },
            {
                identifier: '456',
                source: 'source2',
                msisdn: '9876543210',
                event: 'event2',
                version: '2.0',
                platform: 'android',
                timestamp: '2023-09-12T14:00:00.000Z',
            },
        ];
        formatEventsMock.withArgs(mockInitialData).returns(mockFormattedEvents);

        // Mock the behavior of exportDataToCSV function

        makeHeadersMock.withArgs(mockFormattedEvents[0]).returns(mockHeaders)

        exportDataToCSVMock
            .withArgs(
                mockHeaders,
                mockFormattedEvents,
                '2023-09-12'
            )
            .resolves();

        // Inject the mocks into the fetchDataWithScroll function
        const result = await fetchDataWithScroll(
            fetchInitialDataMock,
            formatEventsMock,
            exportDataToCSVMock
        );

        // Assert the expected behavior
        // In this example, we are assuming that the result should be 'Data exported to CSV file for the current date.'
        // Replace this with your actual expected result.
        expect(result).to.equal('Data exported to CSV file for the current date.');
    });
});


