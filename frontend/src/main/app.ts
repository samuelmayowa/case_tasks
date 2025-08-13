import * as path from 'path';

import { HTTPError } from './HttpError';
import { Nunjucks } from './modules/nunjucks';

import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import { glob } from 'glob';
import favicon from 'serve-favicon';

const { setupDev } = require('./development');

const env = process.env.NODE_ENV || 'development';
const developmentMode = env === 'development';

export const app = express();
app.locals.ENV = env;

new Nunjucks(developmentMode).enableFor(app);

app.use(favicon(path.join(__dirname, '/public/assets/images/favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate, no-store');
  next();
});

// Auto-load route files
glob
  .sync(path.join(__dirname, '/routes/**/*.+(ts|js)'))
  .map(filename => require(filename))
  .forEach(route => route.default(app));

// Dev-only helpers
setupDev(app, developmentMode);

/** 404 handler — must come AFTER all routes */
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new HTTPError('Not Found', 404)); 
});

/** Central error handler (4 args) */
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const status = err?.status || err?.statusCode || 500;
  const message = err?.message || 'Internal Server Error';

  if (developmentMode) {
    // eslint-disable-next-line no-console
    console.error('[frontend:error]', { status, message, path: req.path });
  }

  res.status(status);
  res.locals.message = message;
  res.locals.error = developmentMode ? err : {};
  res.render('error.njk');
});
