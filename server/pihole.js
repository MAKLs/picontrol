const axios = require('axios');
const https = require('https');
const qs = require('qs');
const fs = require('fs');
const Agent = https.Agent;
const config = require('./config.js');

const PIHOLE_LISTS = ['white', 'black'];

// Configure axios instance
const client = axios.create({
  baseURL: config.baseURL,
  responseType: 'json',
  httpsAgent: new Agent({
    keepAlive: true,
    ca: fs.readFileSync(config.ca),
  }),
});

// Helpers
const isAddRequestValid = function(parameters) {
  const requiredFields = ['list', 'domain'];
  if (Object.keys(parameters).length !== requiredFields.length) return false;
  requiredFields.forEach((field) => {
    if (!parameters.hasOwnProperty(field)) {
      return false;
    }
  });
  return true;
};

// Middleware functions
const allowCORS = function(req, res, next) {
  res.set({'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*'});
  next();
};

/**
 * Preprocess a request to collect streaming parameters.
 * Also, protect the server from malicious or faulty clients
 * by limiting the size of the request parameters.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
const parseBody = function(req, res, next) {
  const chunks = [];
  let dataLength = 0;
  let shouldContinue = true;
  req.on('data', (data) => {
    dataLength += data.length;
    chunks.push(data);
    if (dataLength > 1e6) {
      res.status(500);
      res.send('Body too large');
      req.connection.destroy();
      shouldContinue = false;
    }
  });

  req.on('end', () => {
    let body = {};
    try {
      const data = Buffer.concat(chunks);
      body = JSON.parse(data.toString());
    } catch (error) {

    } finally {
      req.body = body;
      if (shouldContinue) next();
    }
  });
};

/**
 * Retrieve the white- and black-lists stored in Pihole
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
const getLists = function(req, res, next) {
  const result = {errors: []};
  let lists = [];
  // If no lists are passed, get all
  if (req.body.list === undefined) {
    lists = PIHOLE_LISTS;
  } else if (PIHOLE_LISTS.includes(req.body.list)) {
    lists = [req.body.list];
  } else {
    // Invalid list passed
    res.status(422);
    result.errors.push(`Invalid list: ${req.body.list}`);
    res.send(result);
    next();
    return;
  }

  // Get all entries from each list
  const promises = lists.map((list) => {
    return client.get('/scripts/pi-hole/php/get.php', {params: {
      list: list,
    }}).then((resp) => {
      result[list] = resp.data;
    }).catch((error) => {
      result.errors.push(`Failed fetching ${list}list: ${error.toString()}`);
    });
  });

  // Once all queries have completed package it up the result and
  // send the response
  Promise.all(promises).then(() => {
    res.status(200);
  }).catch((error) => {
    result.errors.push(error.toString());
    res.status(500);
  }).finally(() => {
    res.type('application/json');
    res.send(result);
    next();
  });
};

/**
 * Add a domain to the white- or black-list in Pihole.
 * @param {string} secret
 * @return {function} Middleware function that accepts a secret to authenticate
 * with Pihole
 */
const addToList = function({secret}) {
  return function(req, res, next) {
    const result = {errors: []};
    res.type('application/json');
    // If body is invalid, no reason to proxy the request
    // Note, the request also requires "pw" but this will be
    // supplied by the proxy later
    if (!isAddRequestValid(req.body)) {
      res.status(422);
      result.errors.push(`Invalid parameters: ${JSON.stringify(req.body)}`);
      res.send(result);
      next();
    } else {
    // Supply proxy's secret
      req.body.pw = secret;

      const options = {
        method: 'POST',
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        data: qs.stringify(req.body),
        url: `${config.baseURL}/scripts/pi-hole/php/add.php`,
      };

      // Make request
      client(options).then((piresp) => {
        res.status(piresp.status);
        result.response = piresp.data;
        console.log(piresp.data);
      }).catch((error) => {
        res.status(403);
        result.errors.push(error.toString());
      }).finally(() => {
        res.send(result);
        next();
      });
    }
  };
};

module.exports = {
  allowCORS,
  parseBody,
  getLists,
  addToList,
};
