export interface ShortIoConfig {
  secretKey: string;
}

export const shortIoConfig: ShortIoConfig = {
  secretKey: process.env.SHORTIO_SECRETKEY,
};

export const tlyConfig: { secretKey: string } = {
  secretKey: process.env.TLY_SECRET,
};
