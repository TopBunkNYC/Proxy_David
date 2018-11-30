require('newrelic');
const express = require('express');
const path = require('path');
const compression = require('compression');
const axios = require('axios');
const parser = require('body-parser');
const services = require('./services.js');
const port = process.env.PORT || 8000;

const app = express();

app.use(express.static(path.join(__dirname, '/public')));
app.use(parser.json());
if (process.env.useCompression === 'true') {
  app.use(compression());
} 

app.all('/*', function(req, res, next) {
 res.header('Access-Control-Allow-Origin', '*');
 next();
});

// To be modified: Description API endpoint
// app.get('/description', (req, res) => {
//   axios.get(`http://52.14.238.117${req.url}`)
//     .then((results) => {
//       res.send(results.data);
//     })
//     .catch((err) => {
//       console.error(err);
//       res.send();
//     });
// });

// To be modified: Booking API endpoints
// app.get('/bookinglisting/:id', (req, res) => {
//   let id = req.params.id
//   axios.get(`http://18.216.104.91/bookinglisting/${id}`)
//     .then((results) => res.send(results.data))
//     .catch((err) => console.error(err));
// });

// Reviews API endpoints
app.get('/ratings', (req, res) => {
  axios.get(`${services.Reviews}${req.url}`)
    .then((results) => {
      res.send(results.data);
    })
    .catch((err) => {
      console.error(err);
      res.send();
    });
});

app.get('/reviews', (req, res) => {
  axios.get(`${services.Reviews}${req.url}`)
    .then((results) => {
      res.send(results.data);
    })
    .catch((err) => {
      console.error(err);
      res.send();
    });
});

app.get('/search', (req, res) => {
  axios.get(`${services.Reviews}${req.url}`)
    .then((results) => {
      res.send(results.data);
    })
    .catch((err) => {
      console.error(err);
      res.send();
    });
});

// To be modified: Neighborhood API endpoints
// app.get('/listingdata', (req, res) => {
//   let requestId = req.query.id;
//   requestId = requestId.slice(-3) * 1;  // TO BE UPDATED
//   axios.get(`http://3.16.89.66/listingdata?id=${requestId}`)
//     .then((results) => res.send(results.data))
//     .catch((err) => console.error(err));
// });

// app.get('/neighborhooddata', (req, res) => {
//   let requestId = req.query.id;
//   requestId = requestId.slice(-3) * 1;  // TO BE UPDATED
//   axios.get(`http://3.16.89.66/neighborhooddata?id=${requestId}`)
//     .then((results) => res.send(results.data))
//     .catch((err) => console.error(err));
// });

// app.get('/landmarkdata', (req, res) => {
//   let lat = req.query.listingLat;
//   let long = req.query.listingLong;
//   axios.get(`http://3.16.89.66/landmarkdata?listingLat=${lat}&listingLong=${long}`)
//     .then((results) => res.send(results.data))
//     .catch((err) => console.error(err));
// });

const getSSRTuples = (id) => {
  return Promise.all([
    // 0: Reviews
    axios.get(`${services.Reviews}/renderReviews`, {
      params: {
        id: id
      }
    })
    .then(({data}) => {
      return data;
    })
    .catch((err) => console.error(err))

    // ,
    // 1: Description

    // 2: Booking

    // 3: Neighborhood

  ])
  .catch((err) => {
    console.error(err);
  })
}


// Send back SSR response to main request
app.get('/listings', (req, res) => {    
  getSSRTuples(req.query.id)
  .then((results) => {
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8">
      <link rel="stylesheet" href="/style.css">
      <link rel="stylesheet" href="${services.Reviews}/style.css">
      <!-- <link type="text/css" rel="stylesheet" href="http://18.218.27.164/style.css"> -->
      <!-- <link type="text/css" rel="stylesheet" href="http://3.16.89.66/style.css"> -->
      <!-- <link type="text/css" rel="stylesheet" href="http://18.216.104.91/guestBar.css"> -->
      <link rel="icon" type="image/png" href="https://s3.us-east-2.amazonaws.com/topbunk-profilephotos/favicon.ico">
      <title>TopBunk</title>
      </head>
      
      <body>
      <div class="container-left">
      <div id="description"></div>
      <div id="reviews">${results[0][0]}</div>
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
      
      <script src="${services.ReviewsClient}"></script>
      <!-- INSERT ALL CLIENT BUNDLES ABOVE THIS LINE -->
      
      <script>
      ReactDOM.hydrate(
        React.createElement(Reviews, ${results[0][1]}),
        document.getElementById('reviews')
        );
      </script>
      </body>
      </html>
    `);
  })
  .catch((err) => console.error(err))
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});
 
app.listen(port, () => {
  console.log(`server running at port: ${port}`);
});