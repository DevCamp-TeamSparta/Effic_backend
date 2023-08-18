export interface IamConfig {
  apiKey: string;
  secretKey: string;
}

export const iamConfig: IamConfig = {
  apiKey: process.env.IAM_APIKEY,
  secretKey: process.env.IAM_SECRETKEY,
};
