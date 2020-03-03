# aws-lambda-youtube-dl

> This project is no longer maintained. AWS does no longer bundle python in Node.js runtimes.

Download YouTube (and a [few other sites](https://ytdl-org.github.io/youtube-dl/supportedsites.html)) videos to S3 using Lambda powered by [youtube-dl](https://ytdl-org.github.io/youtube-dl/index.html).

## Deploy and Test

> You need an up-to-date [AWS CLI](https://aws.amazon.com/cli/) installed and configured on your machine and [Node.js v8.10](https://nodejs.org/).

If you never worked with `aws cloudformation package` before, create an S3 bucket that stores the ZIP files that the `package` command generates. Run the following command and replace `YOUR_BUCKET` with a unique bucket name: `aws s3 mb s3://YOUR_BUCKET`.

Run the following commands (replace `YOUR_BUCKET` with your S3 bucket name to store ZIP files) to package the source code:

```
npm i
aws cloudformation package --s3-bucket YOUR_BUCKET --template-file template.yml --output-template-file .packaged.yml
```

Your output will look mostly like this:

```
Uploading to 864a6c31b9b19e4abfba8d28d719b9a8  8460482 / 8460482.0  (100.00%)
Successfully packaged artifacts and wrote output template to file .packaged.yml.
Execute the following command to deploy the packaged template
aws cloudformation deploy --template-file /Users/michael/Projects/widdix/aws-lambda-youtube-dl/.packaged.yml --stack-name <YOUR STACK NAME>
```

Now it's time to deploy the CloudFormation stack:

```
aws cloudformation deploy --stack-name aws-lambda-youtube-dl --template-file .packaged.yml --capabilities CAPABILITY_IAM
```

Your output will look like this:

```
Waiting for changeset to be created..
Waiting for stack create/update to complete
Successfully created/updated stack - aws-lambda-youtube-dl
```
Finally, you can download YouTube video:

```
aws lambda invoke --function-name aws-lambda-youtube-dl --payload '{"videoUrl": "https://www.youtube.com/watch?v=5QrzWPFucC4"}' .out.txt && cat .out.txt
```

Your output will look like this:

```
{
    "StatusCode": 200,
    "ExecutedVersion": "$LATEST"
}
{"bucketName":"aws-lambda-youtube-dl-bucket-fk6s5c4z7z9s","key":"d7d7cbc7-27c6-4ed2-bf18-82c98138be8d.mp4","url":"s3://aws-lambda-youtube-dl-bucket-fk6s5c4z7z9s/d7d7cbc7-27c6-4ed2-bf18-82c98138be8d.mp4"}
```

That's it.

> To clean up, empty the S3 bucket that stores your video and remove the CloudFormation stack you created.

## Interface

### Event

```
{
  "videoUrl": "https://www.youtube.com/watch?v=5QrzWPFucC4"
}
```

### Response

```
{
  "bucketName": "test",
  "key": "xyz.mp4",
  "url": "s3://test/xyz.mp4"
}
```

The key is generated based on the [awsRequestId](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html). The video is always in mp4 format.

## Limitations

* The new `nodejs10.x` Lambda runtime does not contain `python` anymore, and therefore, `youtube-dl` does not work.
* The download from YouTube and upload to S3 must finish within 15 minutes (I have not found a video that was too big).
