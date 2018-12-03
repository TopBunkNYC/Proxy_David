module.exports = {
  'reviewsHost': process.env.reviewsHost || 'http://ec2co-ecsel-1r1awabnkqgzv-347745579.us-east-2.elb.amazonaws.com:8001',
  'reviewsClient': process.env.reviewsClient || 'https://s3.us-east-2.amazonaws.com/topbunk-profilephotos/client-bundle.js',
  'descriptionHost': process.env.descriptionHost || 'http://ec2co-ecsel-uzede5a0l6oa-1604819410.us-east-1.elb.amazonaws.com:7000',
  'descriptionClient': process.env.descriptionClient || 'https://s3.amazonaws.com/topbunk-nyc-description/bundle.js',
  'neighborhoodHost': process.env.neighborhoodHost || 'http://sdc-neighb-989266127.us-east-2.elb.amazonaws.com/',
  'neighborhoodClient': process.env.neighborhoodClient || 'http://sdc-neighb-989266127.us-east-2.elb.amazonaws.com/app.js',
  'bookingHost': process.env.bookingsHost || 'http://ec2co-ecsel-14mqx2j7r6mip-726135605.us-east-2.elb.amazonaws.com:9005',
  'bookingClient': process.env.bookingsClient || 'https://s3.amazonaws.com/topbunk/bundle.js'
}
