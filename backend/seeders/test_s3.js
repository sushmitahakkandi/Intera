const { PutObjectCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/cloud/s3');
require('dotenv').config();

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'mahaveer-smart-furniture-hub';

const testS3 = async () => {
  try {
    console.log(`Checking access to bucket: ${BUCKET_NAME}`);
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    console.log('Bucket exists and is accessible!');

    const key = `test-connection-${Date.now()}.txt`;
    console.log(`Testing file upload: ${key}`);
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: 'S3 Connection Test Successful',
      ContentType: 'text/plain'
    });
    await s3Client.send(command);
    console.log('Upload successful!');
    console.log(`File URL: https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`);
  } catch (error) {
    console.error('S3 Connection Test Failed:', error);
  }
};

testS3();
