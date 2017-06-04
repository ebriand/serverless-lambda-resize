'use strict';

var AWS = require('aws-sdk');
var S3 = new AWS.S3();

function getS3Key(srcKey) {
  var s3Key = srcKey.replace(/\+/g, ' ');
  return decodeURIComponent(s3Key);
}

module.exports.onImageDeleted = (event, context, callback) => {
  var srcKey    = getS3Key(event.Records[0].s3.object.key);
  var dstBucket = process.env.BUCKET;

  S3.deleteObject({ Bucket: process.env.BUCKET, Key: srcKey }).promise()
  .then(function(response) {
    console.log('Successfully removed ' + process.env.BUCKET + '/' + srcKey);
    callback(null, 'Successfully removed ' + process.env.BUCKET + '/' + srcKey);
  });
};
