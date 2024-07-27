import Elysia from "elysia";

const customResponse = ({ response, set }:{ response: any, set: any }): any => {
    if (typeof set !== 'object' || set === null) {
        throw new Error('Invalid set object');
    }

    // Function to check if the response is a file
    const isResponseFile = (r:any) => {
        // Check for common file properties or headers
        return r?.headers?.get('content-type')?.startsWith('image/') || 
               r?.headers?.get('content-type')?.startsWith('application/') ||
               r?.headers?.get('content-type')?.startsWith('text/') ||
               r?.type?.startsWith('image/') ||
               r?.type?.startsWith('text/');
    };

    // If the response is a file, return it as is
    if (isResponseFile(response)) {
        return response;
    }
    
    // console.log("r: ",response);
    // console.log("headers: ",response.headers);
    
    // Global vars to capture response data
    let msg: string|null = null;
    let err: string|null = null;
    let dta: any|null = null;
    let cde: number = 0;

    const sanitizeResponse = () => {
        // Capture "message"  and "data" data from response
        msg = response?.message ?? null;
        err = response?.error ?? null;
        dta = response?.data ?? null;
        cde = response?.code ?? null;
        delete response?.message;
        delete response?.error;
        delete response?.data;
        delete response?.cde;
    }
    
    // if(set.status !== 401 && set.status !== 403){
        sanitizeResponse();
    // }

    // Check if response is an empty object
    const isEmptyObject = (response: Response): boolean => 
        // Check if the object is not null and is of type 'object'
        response !== null && typeof response === 'object' && Object.keys(response).length === 0;

    const responseObject = {
        data: dta,
        success: [200, 201, 202].includes(cde),
        code: cde ?? set.status,
        message: msg ?? (response instanceof Object ? null : String(response)),
        error: err ?? null
    };
 
    return isResponseFile(response) ? response : responseObject;
};

export default customResponse;