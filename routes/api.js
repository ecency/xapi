const express = require('express');
const decamelize = require('decamelize');
const _ = require('lodash');
const { methods } = require('./methods.js');
const dhive = require('@hiveio/dhive');
const { SERVER_LIST } = require('./utils.js');
const { isArray } = require('lodash');

const router = express.Router();

let client = new dhive.Client(SERVER_LIST, {
  timeout: 4000,
  failoverThreshold: 10,
  consoleOnFailover: true,
});

router.get('/', (req, res) => {
  res.redirect('https://ecency.com');
});

router.get('/:method', async (req, res) => {
  const query = parseQuery(req.query);
  const method = decamelize(req.params.method, '_');
  const mapping = _.filter(methods, { method: method });
  let params = null;

  if (mapping[0]) {
    if (mapping[0].params && isArray(mapping[0].params)) {
      params = [];
      mapping[0].params.forEach((param) => {
        const queryParam = query[param] || query[decamelize(param)];
        params.push(queryParam);  
      });
    } else {
      params = []
    }
    try {
      // console.log(mapping[0].api, method, params);
      const result = await client.call(mapping[0].api, method, params);
      
      // rpc response
      res.set('Cache-Control', 'public, max-age=31536000'); // 1 year
      res.json(result);
    } catch (error) {
      // other script errors
      res.set('Cache-Control', 'public, max-age=60'); // 1 minute
      res.json(error);
    }
  } else {
    // unexpected and wrong api calls
    res.set('Cache-Control', 'public, max-age=60'); // 1 minute
    res.json({});
  }
});

const parseQuery = (query) => {
  let newQuery = {};
  Object.keys(query).map(key => {
    let value = query[key];
    try { value = JSON.parse(decodeURIComponent(value)); }
    catch (e) { }
    newQuery[key] = value;
  });
  return newQuery;
};

module.exports = router;
