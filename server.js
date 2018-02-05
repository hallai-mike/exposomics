/* eslint no-console:0 */

import next from 'next';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { BadRequest } from 'http-errors';
import { resetIdCounter } from 'react-tabs';
import moment from 'moment';
import config from './config';
import MongooseManager from './utils/MongooseManager';
import apps from './apps/index.server';

const port = parseInt(config.get('port'), 10);
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {
  await MongooseManager.connect();

  const app = new Koa();
  const router = new Router();

  router.get('/favicon.ico', ctx => {
    ctx.redirect('/static/favicon.ico');
  });

  router.post('/api/places', async ctx => {
    const { request: { body } } = ctx;

    const places = body.places.map((place, idx) => {
      const result = {};

      ['location', 'fromDate', 'toDate'].forEach(key => {
        if (!place[key]) {
          throw new BadRequest(`No ${key} is provided for place ${idx}`);
        }
      });

      // TODO: convert location to Location class and use the same also on frontend
      result.location = place.location;

      ['fromDate', 'toDate'].forEach(key => {
        try {
          result[key] = moment(new Date(place[key]));
        } catch (e) {
          throw new BadRequest(
            `Wrong ${key} is provided for place ${
              idx
            }. Expected ISO-8601 formatted string.`,
          );
        }
      });

      if (result.toDate.isBefore(result.fromDate)) {
        throw new BadRequest(
          `Wrong fromDate is provided for place ${
            idx
          }. It cannot be before toDate.`,
        );
      }

      // TODO: some more checks

      return result;
    });

    if (!places.length) {
      throw new BadRequest('Please provide at least one place where you lived');
    }

    const resultsArr = await Promise.all(
      Object.keys(apps).map(async name => ({
        name,
        results: await apps[name](places),
      })),
    );

    const results = {};
    resultsArr.forEach(item => {
      results[item.name] = item.results;
    });
    console.log(results)
    ctx.body = results;
  });

  router.post('/api/places-monthly', async ctx => {
    const { request: { body } } = ctx;

    const places = body.places.map((place, idx) => {
      const result = {};

      ['location', 'fromDate', 'toDate'].forEach(key => {
        if (!place[key]) {
          throw new BadRequest(`No ${key} is provided for place ${idx}`);
        }
      });

      // TODO: convert location to Location class and use the same also on frontend
      result.location = place.location;

      ['fromDate', 'toDate'].forEach(key => {
        try {
          result[key] = moment(new Date(place[key]));
        } catch (e) {
          throw new BadRequest(
            `Wrong ${key} is provided for place ${
              idx
            }. Expected ISO-8601 formatted string.`,
          );
        }
      });

      if (result.toDate.isBefore(result.fromDate)) {
        throw new BadRequest(
          `Wrong fromDate is provided for place ${
            idx
          }. It cannot be before toDate.`,
        );
      }

      // TODO: some more checks

      return result;
    });

    if (!places.length) {
      throw new BadRequest('Please provide at least one place where you lived');
    }

    const resultsArr = await Promise.all(
      Object.keys(apps).map(async name => ({
        name,
        results: await apps[name](places),
      })),
    );

    const results = {};
    resultsArr.forEach(item => {
      // results[item.name] = item.results;
      let rArr = []
      let count = 1
      let total = 0
      item.results.dataList.forEach(dataObj => {
        total += dataObj["value"]
        if (count % 30 == 0) {
          const o = item.results.dataList[count-30]
          o["value"] = parseInt(total/30)
          console.log(o)
          rArr.push(o)

          total = 0
        }
        count += 1

      })
      item.results.dataList = rArr
      results[item.name] = item.results
    });
    // console.log(results)
    ctx.body = results;
  });

  router.get('*', async ctx => {
    resetIdCounter();
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
  });

  app.use(async (ctx, nextMiddleware) => {
    ctx.res.statusCode = 200;
    await nextMiddleware();
  });

  app.use(async (ctx, nextMiddleware) => {
    try {
      await nextMiddleware();
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = {
        status: ctx.status,
        name: err.name,
        message: err.message,
      };
      ctx.app.emit('error', err, ctx);
    }
  });
  app.use(bodyParser());
  app.use(router.routes());
  app.use(router.allowedMethods());

  await new Promise((resolve, reject) => {
    app.listen(port, err => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });

  console.log(`> Ready on http://localhost:${port}`);
});
