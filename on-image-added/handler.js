'use strict';

var fs = require('fs');
var im = require('imagemagick');
var AWS = require('aws-sdk');
var S3 = new AWS.S3();

module.exports.onImageAdded = (event, context, callback) => {
  var srcBucket = event.Records[0].s3.bucket.name;
  var srcKey    = getS3Key(event.Records[0].s3.object.key);
  var dstBucket = process.env.BUCKET;
  var dstKey = srcKey;

  S3.getObject({ Bucket: srcBucket, Key: srcKey }).promise()
  .then((response) => {
    return resize(dstKey, response.Body, callback);
  })
  .then((thumbnail) => {
    return S3.putObject({
      Body: thumbnail,
      Bucket: dstBucket,
      ContentType: 'image/png',
      Key: dstKey,
      ACL: 'public-read'
    }).promise()
  })
  .then(() => {
      console.log('Successfully resized ' + srcBucket + '/' + srcKey + ' and uploaded to ' + dstBucket + '/' + dstKey);
      callback(null, 'Successfully resized ' + srcBucket + '/' + srcKey + ' and uploaded to ' + dstBucket + '/' + dstKey);
  })
  .catch((error) => {
    console.log('Error during resize', error);
    callback(error);
  });
};


function resize(dstKey, image, callback) {
  return new Promise((resolve) => {
    im.resize({width: 256, srcData: image, dstPath: '/tmp/' + dstKey}, function() {
        resolve(fs.readFileSync('/tmp/' + dstKey));
    });
  });
}

function getS3Key(srcKey) {
  var s3Key = srcKey.replace(/\+/g, ' ');
  return decodeURIComponent(s3Key);
}
