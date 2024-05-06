import Elysia from "elysia";

interface fResponse {
    data: any;
    // total: number|null;
    success: boolean;
    code: number;
    message: string|null;
}
interface nResponse {
    data: any;
    code: number;
    message: string|null;
}

const customResponse = ({ response, set }:any): any => {    
    
    // Override the response
    let msg: string|null = null;
    let dta: any|null = null;

    function sanitizeResponse(){
        // Capture "message" object from response, for redirection
        if(!!response?.message){
            msg = response?.message ?? null;
            delete response?.message
        }

        // Capture data object to be reproduced in local data object
        if(!!response?.data){
            dta = response?.data ?? null;
            delete response?.data
        }
    }
    
    if(set.status !== 401 && set.status !== 403){
        sanitizeResponse();
    }
    

    // Check if response is an empty object
    function isEmptyObject(response: Response) {
        // Check if the object is not null and is of type 'object'
        if (response !== null && ( typeof response === 'object' ) ) {
          // Check if the object has no own properties
          return Object.keys(response).length === 0;
        }
        // If the object is not an object or is null, it's not an empty object
        return false;
    }

    const fixedResponse: {data: any, success: boolean, code: number, message: string|null, error?: null} = {
        data: dta,
        success: (set.status === 200 || set.status === 201 || set.status === 202),
        code: set.status,
        message: msg,
        error: null
    };

    const noResponse: {data: any, code: number, message: string|null, error?:null} = {
        data: dta,
        code: set.status,
        message: msg ?? response.toString(),
        error: null
    }

    // console.debug("response: ",response);
    
    return (response instanceof Object) ? fixedResponse : noResponse;
};

export default customResponse;