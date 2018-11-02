const express = require('express');
const path = require('path');
const axios = require('axios');
const morgan = require('morgan');
const app = express();
const port = process.env.PORT || 7000;
const CORS = require('cors');
const bodyparser = require('body-parser');

app.use(express.static(path.join(__dirname, 'Public')));

app.use(morgan('dev'));
app.use(bodyparser.json());

app.use (CORS())
app.all('/*', function(req, res, next) {
 res.header('Access-Control-Allow-Origin', '*');
 next();
});

app.get('/bookinglisting/:id', (req, res) => {
  let id = req.params.id
  axios.get(`http://18.216.104.91/bookinglisting/${id}`)
    .then((results) => res.send(results.data))
    .catch((err) => console.error(err));
});

app.get('/listing', (req, res)=>{
  res.sendFile(path.join(__dirname + '/Public/index.html'))
});

app.get('/ratings', (req, res) => {
  axios.get(`http://18.218.27.164${req.url}`)
    .then((results) => {
      res.send(results.data);
    })
    .catch((err) => {
      console.log(err);
      res.send();
    });
});

app.get('/reviews', (req, res) => {
  axios.get(`http://18.218.27.164${req.url}`)
    .then((results) => {
      res.send(results.data);
    })
    .catch((err) => {
      console.log(err);
      res.send();
    });
});

app.get('/search', (req, res) => {
  axios.get(`http://18.218.27.164${req.url}`)
    .then((results) => {
      res.send(results.data);
    })
    .catch((err) => {
      console.log(err);
      res.send();
    });
});

app.get('/listingdata', (req, res) => {
  let requestId = req.query.id;
  requestId = requestId.slice(-3) * 1;
  axios.get(`http://3.16.89.66/listingdata?id=${requestId}`)
    .then((results) => res.send(results.data))
    .catch((err) => console.error(err));
});

app.get('/neighborhooddata', (req, res) => {
  let requestId = req.query.id;
  requestId = requestId.slice(-3) * 1;
  axios.get(`http://3.16.89.66/neighborhooddata?id=${requestId}`)
    .then((results) => res.send(results.data))
    .catch((err) => console.error(err));
});

app.get('/landmarkdata', (req, res) => {
  let lat = req.query.listingLat;
  let long = req.query.listingLong;
  axios.get(`http://3.16.89.66/landmarkdata?listingLat=${lat}&listingLong=${long}`)
    .then((results) => res.send(results.data))
    .catch((err) => console.error(err));
});

app.get('/description', (req, res) => {
  axios.get(`http://52.14.238.117${req.url}`)
    .then((results) => {
      res.send(results.data);
    })
    .catch((err) => {
      console.error(err);
      res.send();
    });
});
 
app.listen(port, () => {
  console.log(`server running at: http://localhost:${port}`);
});