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

/////////// Microservice endpoints ///////////
// Description API endpoint
app.get('/description', (req, res) => {
  axios.get(`${services.descriptionHost}${req.url}`)
    .then((results) => {
      res.send(results.data);
    })
    .catch((err) => {
      console.error(err);
      res.send();
    });
});

// Booking API endpoint
app.get('/bookinglisting/:id', (req, res) => {
  let id = req.params.id
  axios.get(`${services.bookingHost}/bookinglisting/${id}`)
    .then((results) => res.send(results.data))
    .catch((err) => console.error(err));
});

// Reviews API endpoints
app.get('/ratings', (req, res) => {
  axios.get(`${services.reviewsHost}${req.url}`)
    .then((results) => {
      res.send(results.data);
    })
    .catch((err) => {
      console.error(err);
      res.send();
    });
});

app.get('/reviews', (req, res) => {
  axios.get(`${services.reviewsHost}${req.url}`)
    .then((results) => {
      res.send(results.data);
    })
    .catch((err) => {
      console.error(err);
      res.send();
    });
});

app.get('/search', (req, res) => {
  axios.get(`${services.reviewsHost}${req.url}`)
    .then((results) => {
      res.send(results.data);
    })
    .catch((err) => {
      console.error(err);
      res.send();
    });
});

// Neighborhood API endpoints
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

/////////// SSR for page & main /listings endpoint ///////////

const getSSRObjects = (id) => {
  return Promise.all([
    // 0: Reviews
    axios.get(`${services.reviewsHost}/renderReviews`, {
      params: {
        id: id
      }
    })
    .then(({data}) => {
      return data;
    })
    .catch((err) => {
      console.error(err)
    }),

    // 1: Description
    axios.get(`${services.descriptionHost}/renderDescription`, {
      params: {
        id: id
      }
    })
    .then(({data}) => {
      return data;
    })
    .catch((err) => {
      console.error(err)
    }),

    // 2: Booking
    axios.get(`${services.bookingHost}/renderBooking`, {
      params: {
        id: id
      }
    })
    .then(({data}) => {
      return data;
    })
    .catch((err) => {
      console.error(err)
    }),

    // 3: Neighborhood
    axios.get(`${services.neighborhoodHost}/renderNeighborhood`, {
      params: {
        id: id
      }
    })
    .then(({data}) => {
      return data;
    })
    .catch((err) => {
      console.error(err)
    })
  ])
  .catch((err) => {
    console.error(err);
  })
}


// Send back SSR response to main request
app.get('/listings', (req, res) => {    
  getSSRObjects(req.query.id)
  .then((results) => {
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <!-- Proxy stylesheet -->
        <link rel="stylesheet" href="/style.css">
        <!-- Reviews stylesheet -->
        <link type="text/css" rel="stylesheet" href="${services.reviewsHost}/style.css">
        <!-- Bookings stylesheets -->
        <link type="text/css" rel="stylesheet" href="${services.bookingHost}/guestBar.css">
        <link type="text/css" rel="stylesheet" href="${services.bookingHost}/flexboxgrid2.css">
        <link type="text/css" rel="stylesheet" href="${services.bookingHost}/_datepicker.css">
        <link rel="icon" type="image/png" href="https://s3.us-east-2.amazonaws.com/topbunk-profilephotos/favicon.ico">
        <title>TopBunk</title>
      </head>
      
      <body>
        <div class="container-left">
          <div id="description">${results[1].ssr_html}</div>
          <div id="reviews">${results[0].ssr_html}</div>
          <!-- <div id="neighborhood">${results[3].ssr_html}</div> -->
        </div>
        <div class=container-right>
          <div id="booking">${results[2].ssr_html}</div>
        </div>
        
        <script crossorigin src="https://unpkg.com/react@16/umd/react.development.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
            
        <!-- BEGINNING: CLIENT BUNDLES -->
        <script src="${services.descriptionClient}"></script>
        <script src="${services.reviewsClient}"></script>
        <script src="${services.neighborhoodClient}"></script>
        <script src="${services.bookingClient}"></script>
        <!-- END: CLIENT BUNDLES -->
        
        <!-- BEGINNING: HYDRATION -->
        <script>
        ReactDOM.hydrate(
          React.createElement(Description, ${results[1].props}),
          document.getElementById('description')
          );
        </script>

        <script>
        ReactDOM.hydrate(
          React.createElement(Booking, ${JSON.stringify(results[2].props)}),
          document.getElementById('booking')
          );
        </script>

        <script>
        ReactDOM.hydrate(
          React.createElement(Reviews, ${results[0].props}),
          document.getElementById('reviews')
          );
        </script>

        <!-- <script>
        ReactDOM.hydrate(
          React.createElement(Neighborhood, ${results[3].props}),
          document.getElementById('neighborhood')
          );
        </script> -->

        <!-- END: HYDRATION -->

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