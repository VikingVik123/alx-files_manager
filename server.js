const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const routes = require('./routes');

app.use('/', routes);

app.listen(port, () => {
    console.log(`Example app listening on port ${PORT}`)
})