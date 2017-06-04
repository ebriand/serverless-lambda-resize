'use strict';

var admin = require('firebase-admin');

var serviceAccount = require('./firebase-serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE
});

module.exports.onThumbnailAdded = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  var imageName = event.Records[0].s3.object.key;
  var db = admin.database();
  var ref = db.ref('gallery');
  var imageRef = ref.push();
  imageRef.set({
    name: imageName,
    thumbnailUrl: 'https://s3-eu-west-1.amazonaws.com/' + process.env.BUCKET + '/' + imageName
  })
  .then(function () {
    callback(null, 'Done.');
  }).catch(function (error) {
    callback('Database set error ' + error);
  });
};
