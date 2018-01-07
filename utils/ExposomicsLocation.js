/**
 * This class wraps the raw location data (json) from the front end and provides some helpful functions
 * like getCounty and getState.
 */
export default class ExposomicsLocation {
  constructor(rawJson) {
    /** @type {Object} */
    this.rawJson = rawJson;
  }

  /** @private */
  getAddressComponents() {
    return this.rawJson.location.address_components;
  }

  /**
   * @return {String}
   */
  getCounty() {
    const addressComponents = this.getAddressComponents();

    for (const ac of addressComponents) {
      const types = ac.types;
      if (types.indexOf('administrative_area_level_2') !== -1) {
        return ac.long_name;
      }
    }
    throw new Error('county not found');
  }

  /**
   * @return {String}
   */
  getState() {
    const addressComponents = this.getAddressComponents();

    for (const ac of addressComponents) {
      const types = ac.types;
      if (types.indexOf('administrative_area_level_1') !== -1) {
        return ac.long_name;
      }
    }
    throw new Error('state not found');
  }

  /**
   * @return {String}
   */
  getZipcode() {
    const addressComponents = this.getAddressComponents();

    for (const ac of addressComponents) {
      const types = ac.types;
      if (types.indexOf('postal_code') !== -1) {
        return ac.short_name;
      }
    }
    throw new Error(
      'zipcode not found - you must enter a location with a zipcode',
    );
  }
}
