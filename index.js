const stream = require('stream');
const youtubedl = require('youtube-dl');
const AWS = require('aws-sdk');

exports.handler = function(event, context, cb) {   
  if (!event.videoUrl) {
    return cb(new Error('videoUrl missing in event'));
  }
  const s3 = new AWS.S3({apiVersion: '2006-03-01'});
  const passtrough = new stream.PassThrough();
  const dl = youtubedl(event.videoUrl, ['--format=best[ext=mp4]'], {maxBuffer: Infinity});
  dl.once('error', (err) => {
    cb(err);
  });
  const key = `${context.awsRequestId}.mp4`;
  const upload = new AWS.S3.ManagedUpload({
    params: {
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      Body: passtrough
    },
    partSize: 1024 * 1024 * 64 // in bytes
  });
  upload.on('httpUploadProgress', (progress) => {
    console.log(`[${event.videoUrl}] copying video ...`, progress);
  });
  upload.send((err) => {
    if (err) {
      cb(err);
    } else {
      cb(null, {
        bucketName: process.env.BUCKET_NAME,
        key,
        url: `s3://${process.env.BUCKET_NAME}/${key}`
      });
    }
  });
  dl.pipe(passtrough);
}
