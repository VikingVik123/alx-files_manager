import bodyParser from 'body-parser';
import routes from './routes';
const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

const routes = require('./routes');

app.use(bodyParser.json());
app.use('/', routes);

app.listen(PORT)