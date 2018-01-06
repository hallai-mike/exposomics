import mongoose from 'mongoose';

const TemperatureRecordSchema = new mongoose.Schema(
  {
    zipcode: {
      type: Number,
      required: true,
      unique: false,
    },
    date: {
      type: Number,
      required: true,
      unique: false,
    },
    tmax: {
      type: Number,
      required: false,
      unique: false,
    },
    tmin: {
      type: Number,
      required: false,
      unique: false,
    },
    snow: {
      type: Number,
      required: false,
      unique: false,
    },
    prcp: {
      type: Number,
      required: false,
      unique: false,
    },
  },
  { collection: 'temperature_records' },
);

module.exports = mongoose.model('TemperatureRecord', TemperatureRecordSchema);
