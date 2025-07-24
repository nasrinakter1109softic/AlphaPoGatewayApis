import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class UploadService {
  private s3 = new AWS.S3({
    region: process.env.S3_REGION,
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  });

  async uploadFile(file: {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
  }): Promise<string> {
    const key = `${uuidv4()}-${file.originalname}`;
    if (!process.env.S3_BUCKET) {
      throw new Error('S3_BUCKET environment variable is not defined');
    }
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    const result = await this.s3.upload(params).promise();
    return result.Location;
  }
}
