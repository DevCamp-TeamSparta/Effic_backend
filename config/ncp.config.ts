export interface NcpConfig {
  serviceId: string;
  accessKey: string;
  secretKey: string;
  hostnumber: string;
}

export const ncpConfig: NcpConfig = {
  serviceId: process.env.NCP_SERVICE_ID,
  accessKey: process.env.NCP_ACCESSKEY,
  secretKey: process.env.NCP_SECRETKEY,
  hostnumber: process.env.NCP_HOSTNUMBER,
};
