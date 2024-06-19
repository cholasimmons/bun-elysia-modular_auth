import { HttpStatusEnum } from "elysia-http-status-code/status";
import { CustomError } from "src/_modules/root/app.models";


  
  function handleNotFoundError(error: CustomError, set: any) {
    set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
    return { message: 'Route not found 😔', code: set.status };
  }
  
  function handleInternalServerError(error: CustomError, set: any) {
    set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
    return { message: 'Internal Server Error ⚠️', code: set.status, error: error };
  }
  
  function handleValidation(error: CustomError, set: any) {
    console.error(error);
    
    set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
    if (
      error.validator &&
      error.validator.schema &&
      error.validator.schema.properties
    ) {
      return {
        code: set.status,
        message: 'Schema Validation Error 🚫',
        error: error.validator.schema.properties,
      };
    } else {
      return {
        code: set.status,
        message: 'Data Validation Error 🙈',
        error: error,
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
    set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
    return { code: set.status , message: 'Database has not been initialized' };
  }
  function handleDatabaseValidationError(error: CustomError, set: any) {
    set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
    return { code: set.status , message: 'Data does not adhere to schema standard' };
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
    // set.status = HttpStatusEnum.HTTP_424_FAILED_DEPENDENCY;
    return {
      code: set.status,
      message: 'Insufficient privileges',
      error: error.toString()
    }
  }

  export function ErrorMessages(
    code: string,
    error: Error | CustomError,
    set: any
  ) {

    switch(error.name){
      case 'PrismaClientInitializationError':
        return handleDatabaseInitError(error, set);
      case 'PrismaClientValidationError':
        return handleDatabaseValidationError(error, set);
      case 'PrismaClientKnownRequestError':
        return handleRequestError(error, set);
      case 'Error':
        return handleOAuth2Error(error, set);
    }

    switch (code) {
      case 'NOT_FOUND':
        return handleNotFoundError(error, set);
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
      default:
        console.error(error);

        return { code: set.status, message: 'An unhandled error occurred' };
    }
  }