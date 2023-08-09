export interface JwtConfig {
  secretKey: string;
  refreshTokenSecretKey: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
}

export const jwtConfig: JwtConfig = {
  secretKey: process.env.JWT_SECRETKEY,
  refreshTokenSecretKey: process.env.JWT_REFRESH_SECRETKEY,
  accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
  refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
};
