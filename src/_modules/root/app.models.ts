export interface CustomError extends Error {
    validator?: {
      schema?: {
        properties?: any;
      };
    };
}