export interface ShortIoConfig {
  secretKey: string;
}

export const shortIoConfig: ShortIoConfig = {
  secretKey: process.env.SHORTIO_SECRETKEY,
};
