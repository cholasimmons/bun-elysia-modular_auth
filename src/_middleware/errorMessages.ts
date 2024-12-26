import { HttpStatusEnum } from "elysia-http-status-code/status";
import { CustomError } from "src/_modules/root/app.models";

  
  function handleRouteNotFoundError(error: CustomError, set: any) {
    set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
    return { message: 'Route not found 😔', code: set.status };
  }
  
  function handleNotFoundError(error: CustomError, set: any) {
    set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
    return { message: error.message ?? 'Resource not found', code: set.status, note: 'Resource not found' };
  }
  
  function handleInternalServerError(error: CustomError, set: any) {
    set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
    return { message: error.message ?? 'Internal Server Error ⚠️', code: set.status, error: error.name };
  }
  
  function handleValidation(error: CustomError, set: any) {
    
    set.status = HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE;
    if (error?.validator?.schema?.properties
    ) {
      return {
        code: set.status,
        message: error.validator.schema.properties.message.default ?? error.validator.schema.properties.message.error ?? 'Schema Validation Error 🚫',
        error: 'Schema Validation Error'
      };
    } else {
      return {
        code: set.status,
        message: error.message ?? error.name,
        error: 'Data Validation Error 🙈'
      };
    }
  }
  
  function handleParseError(error: CustomError, set: any) {
    console.warn(error);
    
    set.status = set.status;
    return { message: 'Parse Error 💬', code: set.status, error: error };
  }
  
  function handleUnknownError(error: CustomError, set: any) {
    console.error(error);
    set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
    return { code: set.status , message: '😞 An internal error occurred' };
  }

  function handleDatabaseInitError(error: CustomError, set: any) {
    set.status = error.status ?? HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
    return { code: set.status, message: 'Persistent storage error', note: 'Database has not been initialized' };
  }
  function handleDatabaseValidationError(error: CustomError, set: any) {
    set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
    return { code: set.status , message: 'Data does not adhere to schema standard' };
  }

  function handleDatabaseError(error: CustomError, set: any) {
    set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
    return { code: error.status || set.status, message: 'A persistent storage error occurred', note: error.message };
  }
  
  function handleMinioConnectError(error: CustomError, set: any) {
    set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
    return { code: error.status ?? set.status, message: 'Unable to store S3 buffer', note: error.message };
  }

  function handleOAuth2Error(error: CustomError, set: any) {
    set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
    return { code: set.status , message: 'An authentication state error occured' };
  }
  function handleRequestError(error: CustomError, set: any) {
    set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
    return { code: set.status , message: 'Database known request error' };
  }

  function handleAuthorizationError(error: CustomError, set: any){
    set.status = 500;
    console.error(error);
    
    return {
      code: set.status,
      message: error.toString()
    }
  }

  function handleNoAccessError(error: CustomError, set: any){
    set.status = HttpStatusEnum.HTTP_424_FAILED_DEPENDENCY;
    return {
      code: set.status,
      message: 'Insufficient privileges',
      error: error.message ?? error.toString()
    }
  }

  export const errorMessages = ({
    code,
    error,
    set
  }:any) => {
    console.error('Caught: error.name ', error.name);

    switch(error.name){
      case 'PrismaClientInitializationError':
        return handleDatabaseInitError(error, set);
      case 'PrismaClientValidationError':
        return handleDatabaseValidationError(error, set);
      case 'PrismaClientKnownRequestError':
        return handleRequestError(error, set);
      case 'ConnectionRefused':
        return handleMinioConnectError(error, set);
      case 'DatabaseError':
        return handleDatabaseError(error, set);
      case 'InternalServerError':
        return handleInternalServerError(error, set);
      case 'VALIDATION':
        return handleValidation(error, set);
      case 'NotFoundError':
        return handleNotFoundError(error, set);
    }

    switch (code) {
      case 'INTERNAL_SERVER_ERROR':
        return handleInternalServerError(error, set);
      case 'PARSE':
        return handleParseError(error, set);
      case 'UNKNOWN':
        return handleUnknownError(error, set);
      case 'AUTHORIZATION_ERROR':
        return handleAuthorizationError(error, set);
      case 'AccessDenied':
        return handleNoAccessError(error, set);
      case 'VALIDATION':
        return handleValidation(error, set);
      case 'PrismaClientInitializationError':
        return handleDatabaseInitError(error, set);
      default:
        return { code: set.status, message: 'An unhandled error occurred', note: error.message };
    }
  }