const request = require('request');
const path = require('path');
const fs = require('fs');
const unzip = require('unzip-stream');
const csv = require('csv');
const es = require('event-stream');
const { Readable } = require('stream');

const resultFilename = 'air_quality_records.csv';

export default async resultDataDir =>
  new Promise((resolve, reject) => {
    const rs = new Readable({ read() {} });
    rs
      .pipe(csv.transform(item => JSON.parse(item)))
      .pipe(csv.stringify({ header: true }))
      .pipe(fs.createWriteStream(path.resolve(resultDataDir, resultFilename)));

    request
      .get(
        'https://s3-us-west-1.amazonaws.com/ai.doc.exposomics/airQuality.zip',
      )
      .pipe(unzip.Parse())
      .on('error', reject)
      .on('entry', entry => {
        if (entry.path.endsWith('.csv')) {
          entry
            .pipe(es.split())
            .pipe(
              es.map((item, cb) =>
                csv.parse(
                  item.toString(),
                  {
                    auto_parse: true,
                  },
                  (err, data) => {
                    if (err) {
                      cb(err);
                      return;
                    }

                    if (
                      Array.isArray(data) &&
                      data.length &&
                      Array.isArray(data[0])
                    ) {
                      const state = data[0][0];
                      const county = data[0][1];
                      const date = data[0][4];
                      const aqi = data[0][5];
                      if (typeof aqi === 'number') {
                        rs.push(
                          JSON.stringify({ state, county, date, aqi }, null, 2),
                        );
                      }
                    }

                    cb();
                  },
                ),
              ),
            )
            .on('error', error => {
              throw error;
            });
        } else {
          entry.autodrain();
        }
      })
      .on('close', () => {
        resolve([resultFilename]);
      })
      .on('error', error => {
        reject(error);
      });
  });
