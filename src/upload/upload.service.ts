import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private s3: AWS.S3;

  constructor(private readonly config: ConfigService) {
    this.s3 = new AWS.S3({
      region: config.get<string>('app.s3.region'),
      accessKeyId: config.get<string>('app.s3.accessKey'),
      secretAccessKey: config.get<string>('app.s3.secretKey'),
    });
  }

  async uploadFile(file: {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
  }): Promise<string> {
    const env = this.config.get<string>('app.env') ?? 'development';
    const folder =
      env === 'production' ? 'prod' : env === 'staging' ? 'staging' : 'dev';

    const key = `${folder}/${uuidv4()}-${file.originalname}`;
    console.log(key);
    const bucket = this.config.get<string>('app.s3.bucket');

    if (!bucket) {
      throw new Error('S3_BUCKET is not defined');
    }

    const params = {
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const result = await this.s3.upload(params).promise();
    return result.Location;
  }
}
