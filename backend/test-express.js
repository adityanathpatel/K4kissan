const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
app.get('/', (req, res) => res.send('hello'));
app.listen(5002, () => console.log('Express listening on 5002'));
