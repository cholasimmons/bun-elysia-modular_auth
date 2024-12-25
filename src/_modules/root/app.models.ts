export interface CustomError extends Error {
  status: number;
    validator?: {
      schema?: {
        properties?: any;
      };
    };
}