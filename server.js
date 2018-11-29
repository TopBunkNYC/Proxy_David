require('newrelic');
const express = require('express');
// const morgan = require('morgan');
// const cors = require('cors');
const path = require('path');
const axios = require('axios');
const parser = require('body-parser');
const fetch = require('node-fetch');
const fs = require('fs');
const React = require('react');
const ReactDOM = require('react-dom/server');
const services = require('./services.js');
const components = {};
const port = process.env.PORT || 8000;

const app = express();

app.use(express.static(path.join(__dirname, '/public')));
// app.use(morgan('dev'));
// app.use(cors())
app.use(parser.json());

app.all('/*', function(req, res, next) {
 res.header('Access-Control-Allow-Origin', '*');
 next();
});

// To be modified: Description API endpoint
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

// To be modified: Booking API endpoints
app.get('/bookinglisting/:id', (req, res) => {
  let id = req.params.id
  axios.get(`http://18.216.104.91/bookinglisting/${id}`)
    .then((results) => res.send(results.data))
    .catch((err) => console.error(err));
});

// To be modified: Reviews API endpoints
app.get('/ratings', (req, res) => {
  axios.get(`http://localhost:8001${req.url}`)
    .then((results) => {
      res.send(results.data);
    })
    .catch((err) => {
      console.error(err);
      res.send();
    });
});

app.get('/reviews', (req, res) => {
  axios.get(`http://localhost:8001${req.url}`)
    .then((results) => {
      res.send(results.data);
    })
    .catch((err) => {
      console.error(err);
      res.send();
    });
});

app.get('/search', (req, res) => {
  axios.get(`http://localhost:8001${req.url}`)
    .then((results) => {
      res.send(results.data);
    })
    .catch((err) => {
      console.error(err);
      res.send();
    });
});

// To be modified: Neighborhood API endpoints
app.get('/listingdata', (req, res) => {
  let requestId = req.query.id;
  requestId = requestId.slice(-3) * 1;  // TO BE UPDATED
  axios.get(`http://3.16.89.66/listingdata?id=${requestId}`)
    .then((results) => res.send(results.data))
    .catch((err) => console.error(err));
});

app.get('/neighborhooddata', (req, res) => {
  let requestId = req.query.id;
  requestId = requestId.slice(-3) * 1;  // TO BE UPDATED
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

// Consider downloading client bundles for each component... not at this point

// Download Node server bundles for each component
(() => {
  let serviceNames = ['ReviewsServer'];  // TODO: UPDATE to add other services when available
  serviceNames.forEach((service) => {
    let url = path.join(__dirname, `public/bundles/${service}.js`);
    fs.access(url, (err) => {
      if (err) {
        fetch(services[service])
        .then((response) => {
          const dest = fs.createWriteStream(url);
          response.body.pipe(dest);
          response.body.on('end', () => {
            setTimeout(() => {
              components[service] = require(url).default;
              console.log(`Node server bundle for ${service} written.`)
            }, 1000);
          });
        })
        .catch((err) => {console.error(err)});
      } else {
        components[service] = require(url).default;
        console.log(`Node server bundle for ${service} already exists.`)
      }
    })
  })
})();


// Send back SSR response to main request
app.get('/listings', (req, res) => {
  let apps = {};
  let props = {};
  (async() => {
    // Get all props from services
    await Promise.all([
      // 0: Reviews module, reviews endpoint
      axios.get('http://localhost:8001/reviews', {
        params: {
          id: req.query.id
        }
      }), 

      // 1: Reviews module, ratings endpoint
      axios.get('http://localhost:8001/ratings', {
        params: {
          id: req.query.id
        }
      })
    ])
    .then(({data}) => {
      props.Reviews = {
        reviews: data[0], 
        ratings: data[1], 
        search: [], 
        showSearch: false
      };
      let reviewsComponent = React.createElement(components.ReviewsServer, props.Reviews);
      apps.Reviews = ReactDOM.renderToString(reviewsComponent);
      // add other components like previous two lines
    });

    res.end(`
    <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <link rel="stylesheet" href="/style.css">
          <!-- <link type="text/css" rel="stylesheet" href="http://18.218.27.164/style.css"> -->
          <!-- <link type="text/css" rel="stylesheet" href="http://3.16.89.66/style.css"> -->
          <!-- <link type="text/css" rel="stylesheet" href="http://18.216.104.91/guestBar.css"> -->
          <link rel="icon" type="image/png" href="https://s3.us-east-2.amazonaws.com/topbunk-profilephotos/favicon.ico">
          <title>TopBunk</title>
        </head>

        <body>
          <div class="container-left">
            <div id="description"></div>
            <div id="reviews">${apps.Reviews}</div>
            <div id="neighborhood"></div>
          </div>
          <div class=container-right>
            <div id="booking"></div>
          </div>

          <script crossorigin src="https://unpkg.com/react@16/umd/react.development.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>

          <!-- <script src="http://52.14.238.117/bundle.js"></script>
          <script src="http://18.216.104.91/bundle.js"></script>
          <script src="http://18.218.27.164/bundle.js"></script>
          <script src="http://3.16.89.66/app.js"></script> -->
          
          <!-- <script>ReactDOM.render(React.createElement(Description), document.getElementById('description'));</script> -->
          <!-- <script>ReactDOM.render(React.createElement(Neighborhood), document.getElementById('neighborhood'));</script> -->

          <script src="${services.Reviews}"></script>
          <!-- INSERT ALL CLIENT BUNDLES ABOVE THIS LINE -->

          <script>
            ReactDOM.hydrate(
              React.createElement(Reviews, ${JSON.stringify(props.Reviews)}),
              document.getElementById('reviews')
            );
          </script>
        </body>
      </html>
    `);
  })();
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});
 
app.listen(port, () => {
  console.log(`server running at port: ${port}`);
});