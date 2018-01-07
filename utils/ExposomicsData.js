/** 
* This class provides logic to construct a general exposomics dataset and plot it. 
* To construct a new instance of `ExposomicsData`, you must provide a `dataSource` function that accepts
* a date and returns a numerical value representing the data for that date.
* Note - you have to call the async function `populateDataList` before using an instance of `ExposomicsData`

* @example
* const exposomicsData = new ExposomicsData(dataSource, startDate, endDate, interval)
* exposomicsData.populateDataList()
* plotData = exposomicsData.getPlotData()
* dataJson = JSON.stringify(exposomicsData)

*/
export default class ExposomicsData {
  constructor(dataSource, startDate, endDate, interval) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.interval = interval;

    this.dataSource = dataSource;
    this.dataList = [];
  }

  /**
   * This function iterates from `startDate` to `endDate` at the given interval, and calls `this.dataSource`
   * to generate the data point for each date. The results are stored in `this.dataList`, and can be plotted
   * by calling the `getPlotData` function.
   */
  async populateDataList() {
    for (
      let curDay = this.startDate.clone();
      curDay.isBefore(this.endDate);
      curDay = curDay.clone().add(this.interval)
    ) {
      const value = await this.dataSource(curDay);
      const obj = {
        date: curDay,
        value,
      };

      this.dataList.push(obj);
    }
  }

  /**
   * This function iterates from `startDate` to `endDate` at the given interval, and calls `this.dataSource`
   * to generate the data point for each date. The results are stored in `this.dataList`, and can be plotted
   * by calling the `getPlotData` function.
   */
  async batchPopulateDataList(locationManager, dataSource) {
    // for (
    //   let curDay = this.startDate.clone();
    //   curDay.isBefore(this.endDate);
    //   curDay = curDay.clone().add(this.interval)
    // ) {
    for (const l of locationManager.locationObjects) {
      const results = await dataSource(l);
      for (const r of results) {
        this.dataList.push(r);
      }
    }
  }

  /**
   * This function allows exporting of a user's exposomics data via `JSON.stringify()`
   *
   */
  toJSON() {
    // Return an object containing everything except `this.dataSource`
    const { dataSource, ...result } = this;
    return result;
  }

  /**
   * This function returns the data in a suitable form for plotting. In this case, the result is an array of objects
   * that have `date` and `value` properties. For different plotting applications, this function can be overriden or
   * replaced.
   */
  getPlotData() {
    const values = [];

    for (let i = 0; i < this.dataList.length; i += 1) {
      const obj = this.dataList[i];
      const v = {
        date: obj.date,
        value: obj.value,
      };
      values.append(v);
    }
    return values;
  }
}
