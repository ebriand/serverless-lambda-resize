'use strict';

var admin = require('firebase-admin');

var serviceAccount = require('./firebase-serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE
});

module.exports.onThumbnailDeleted = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  var imageName = event.Records[0].s3.object.key;
  var db = admin.database();
  var ref = db.ref('gallery');
  ref.orderByChild('name').equalTo(imageName).on('value', function(snapshot) {
    var keysToRemove = [];
    snapshot.forEach(function(childSnapshot) {
      keysToRemove.push(childSnapshot.key);
    });
    Promise.all(keysToRemove.map(function(key) {
      return ref.child(key).remove();
    }))
    .then(function () {
      callback(null, 'Done.');
    }).catch(function (error) {
      callback('Database set error ' + error);
    });
  });
};
