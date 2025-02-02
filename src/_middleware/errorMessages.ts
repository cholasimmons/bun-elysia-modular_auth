import { HttpStatusEnum } from "elysia-http-status-code/status";
import { CustomError } from "~modules/root/app.models";

  
function handleServiceUnavailableError(error: CustomError, set: any) {
  set.status = error.status ?? HttpStatusEnum.HTTP_423_LOCKED;
  return {
    success: false,
    code: set.status,
    message: "Server currently undergoing maintenance", // '🚧 Maintenance Mode: ON 🚧',
    error: error.message ?? 'Maintenance Mode ON 🔐'
  };
}

  function handleRouteNotFoundError(error: CustomError, set: any) {
    set.status = error.status ?? HttpStatusEnum.HTTP_404_NOT_FOUND;

    return {
      code: set.status,
      message: 'That route does not exist 😔',
      error: error.cause ?? error.message
    };
  }
  
  function handleNotFoundError(error: CustomError, set: any) {
    set.status = error.status ?? HttpStatusEnum.HTTP_404_NOT_FOUND;
    console.error(error.message);
    
    return {
      code: set.status,
      message: error.message ?? 'Resource not found',
      error: error.cause ?? 'Resource not found' };
  }
  
  function handleInvalidBucketError(error: CustomError, set: any) {
    set.status = error.status ?? HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
    return {
      code: set.status,
      message: 'Server could not access media storage',
      error: error.cause ?? error.message ?? 'Bucket error' };
  }
  
  function handleInternalServerError(error: CustomError, set: any) {
    set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
    return { message: error.message ?? 'Internal Server Error ⚠️', code: error.status ?? set.status, error: error.cause ?? error.name };
  }
  function handleError(error: CustomError, set: any) {
    console.error(error);
    
    set.status = error.status ?? HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
    return {
      code: set.status,
      message: 'Internal Server Error ⚠️',
      error: error.cause ?? error.message ?? error.name };
  }
  
  function handleValidationError(error: CustomError, set: any) {
    
    set.status = error.status = HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE;
    if (error?.validator?.schema?.properties
    ) {
      return {
        code: set.status,
        message: error.validator.schema.properties?.error ?? 'Schema Validation Error 🚫',
        error: error.cause ?? error.validator.schema ?? 'Schema Validation does not tally'
      };
    } else {
      return {
        code: set.status,
        message: error.message ?? error.name,
        error: error.cause ?? 'Data Validation Error 🙈'
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
    set.status = error.status ?? HttpStatusEnum.HTTP_404_NOT_FOUND;
    return {
      code: set.status,
      message: 'Unable to store S3 data',
      error: error.cause ?? error.message
    };
  }

  function handleOAuth2Error(error: CustomError, set: any) {
    set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
    return { code: set.status , message: 'An authentication state error occured' };
  }
  function handleRequestError(error: CustomError, set: any) {
    set.status = error.status ?? HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
    return {
      code: set.status,
      message: 'Database error.',
      error: error.cause ?? error.message,
    };
  }

  function handleConflictError(error:CustomError, set: any) {
    const { status, message, name, cause} = error;
    set.status = status ?? HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
    return {
      code: set.status,
      message: message ?? 'A conflict was detected',
      error: cause ?? name
    };
  }

  function handleAuthorizationError(error: CustomError, set: any){
    set.status = error.status ?? HttpStatusEnum.HTTP_401_UNAUTHORIZED;

    return {
      code: set.status,
      message: "You are not Authorized",
      error: error.message
    }
  }

  function handleAuthenticationError(error: CustomError, set: any){
    set.status = error.status ?? 500;    
    return {
      code: set.status,
      message: "You cannot perform this action",
      error: error.message
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
      case 'ServiceUnavailableError':
        return handleServiceUnavailableError(error, set)
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
      // case 'Error':
      //   return handleError(error, set);
      // case 'VALIDATION':
      //   return handleValidationError(error, set);
      case 'NotFoundError':
        return handleNotFoundError(error, set);
      case 'ConflictError':
        return handleConflictError(error, set);
      case 'AuthenticationError':
        return handleAuthenticationError(error, set);
      case 'AuthorizationError':
        return handleAuthorizationError(error, set);
      case 'ValidationError':
        return handleValidationError(error, set);
      case 'InvalidBucketNameError':
        return handleInvalidBucketError(error, set);
      case 'S3Error':
        return { message: error.message, error: error.cause };
      case 'Error':
        return { message: 'Unknown error detected.'+ error?.type ? error.type : error }
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
        return handleValidationError(error, set);
      case 'PrismaClientInitializationError':
        return handleDatabaseInitError(error, set);
      case 'NoSuchBucket':
        return { message: "Unable to store data. Directory not found 😒" }
      case 'NOT_FOUND':
        return handleRouteNotFoundError(error, set);
      default:
        return { code: set.status, message: 'An unhandled error occurred', note: error.message };
    }
  }