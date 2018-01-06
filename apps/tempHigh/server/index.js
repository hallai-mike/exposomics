import moment from 'moment';
import TemperatureRecord from './models/TemperatureRecord';
import ExposomicsLocationManager from '../../../utils/ExposomicsLocationManager';
import ExposomicsData from '../../../utils/ExposomicsData';
// const AqiExposomics = require('./ExposomicsManager')

/**
 * This function accepts a list of places (json) and returns data to be rendered by the React component

 * @param {Array} places A json object of location and time data from the Google Api

 * @return {Object}
 * @property {moment} result.startDate
 * @property {moment} result.endDate
 * @property {Array} result.dataList
 */
export default (async function controller(places) {
  // Create the location manager with the list of places.
  const locationManager = new ExposomicsLocationManager(places);

  /**
   * queryLogicFunction is a logic function that will be passed to ExposomicsData to construct the list of data points

   * @param {moment} date
   */
  const queryLogicFunction = async function queryLogic(date) {
    // This function has the logic that takes a date, gets the location, queries the database, and returns the AQI
    // Note - this function has access to collection and locationManager from the closure.

    // First get the location corresponding to the input date
    // return -303
    const location = locationManager.getLocation(date);
    if (!location) return -101;

    // Use that location to prepare the database query
    // const state = location.getState();
    const dateString = Number(date.format('YYYYMMDD'));
    const zipcode = Number(location.getZipcode());
    // console.log(dateString, zipcode)
    // let county = location.getCounty();
    // county = county.replace(' County', '');

    // Make the database query
    let result;
    try {
      // Make the async call to the database to get the AQI for a particular location and date.
      // If a different database structure is used, this line will have to get modified (but only this line)
      result = await TemperatureRecord.findOne({
        zipcode,
        date: dateString,
      });
    } catch (e) {
      console.log(e); // eslint-disable-line no-console
    }

    // Return the result
    if (!result) return -202;
    console.log(result.tmax / 10);
    return result.tmax / 10; // Return the actual result to be rendered (also depends on database structure).
  };

  // Set up the dates and date ranges
  const startDate = locationManager.getStartDate();
  const endDate = locationManager.getEndDate();
  const interval = moment.duration(1, 'days');

  // Construct an ExposomicsData object with queryLogicFunction and the date information
  // The ExposomicsData constructor will iterate over the specified date range and query the logic function to get results
  //   for each date.
  const dataObject = new ExposomicsData(
    queryLogicFunction,
    startDate,
    endDate,
    interval,
  );

  await dataObject.populateDataList(); // This needs to be a seperate call because it's an async function
  // and can't be done in the constructor of ExposomicsData

  // Return results in the form that the React component is expecting.
  const result = {
    dataList: dataObject.dataList,
    startDate,
    endDate,
  };
  return result;
});
