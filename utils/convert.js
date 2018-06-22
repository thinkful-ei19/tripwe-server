const csv = require('csvtojson');
const { writeFile } = require('fs');
const util = require('util');
const path = require('path');

const writeFileAsync = util.promisify(writeFile);

/**
 * Helper function to convert the given CSV data to JSON
 *
 */
const csvToJson = async (csvPath, jsonPath) => {
  console.log(csvPath, jsonPath)
  const jsonData = { airports: [] };
  csv()
    .fromFile(csvPath)
    .on('json', jsonObj => {
      console.log(jsonObj)
      jsonData.airports.push(jsonObj)
    })
    .on('done', async () => {
      const writeData = JSON.stringify(jsonData);
      await writeFileAsync(jsonPath, writeData, 'utf8');
      console.info('CSV to JSON done!'); // eslint-disable-line no-console
    });
};


// create airportData.json from airportData.csv
const csvPath = path.resolve(__dirname, '../data', 'airportData1.csv');
const jsonFilePath = path.resolve(__dirname, '../data', 'airportData.json');
csvToJson(csvPath, jsonFilePath);

module.exports = {
  csvToJson
};
