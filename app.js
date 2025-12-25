import express, { static as expressStatic, urlencoded, json } from 'express';
import cors from 'cors';
import compression from 'compression';
const app = express();
import morgan from 'morgan';
import version1APi from "./src/api/v1/index.js";
import { db } from './src/api/v1/config/mongodb.js';
import { autoCancelPendingRides } from "./src/api/v1/jobs/autoCancel.job.js";

import { badRequest } from './src/api/v1/helpers/response.helper.js';

//----------use dependencies----------------------------------
app.use(morgan('dev'));

app.use(cors());
app.use('/static', expressStatic('static'))

app.use(urlencoded({ extended: false }));
app.use(json());

app.use(compression())

// -------------- db check--------------------
db()
// -------------- db check--------------------

setInterval(autoCancelPendingRides, 60 * 1000); // every 1 min



app.use("/v1",version1APi)



app.use(async (req, res) => {
    await badRequest(res, 'Invalid URI');
});

export default app;