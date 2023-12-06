export interface IClientDbService {
  connectToDb(connectionDetails: any): Promise<void>;
  testConnection(): Promise<boolean>;
  executeQuery(query: string): Promise<any>;
}

export const IClientDbServiceSymbol = Symbol('IClientDbServiceSymbol');
