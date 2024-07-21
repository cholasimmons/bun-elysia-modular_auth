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

const customResponse = ({ response, set }:{ response: any, set: any }): any => {
    if (typeof set !== 'object' || set === null) {
        throw new Error('Invalid set object');
    }
    
    // Global vars to capture response data
    let msg: string|null = null;
    let dta: any|null = null;

    function sanitizeResponse(){
        // Capture "message"  and "data" data from response
        msg = response?.message ?? null;
        dta = response?.data ?? null;
        delete response?.message;
        delete response?.data;
    }
    
    // if(set.status !== 401 && set.status !== 403){
        sanitizeResponse();
    // }

    // Check if response is an empty object
    const isEmptyObject = (response: Response): boolean => 
        // Check if the object is not null and is of type 'object'
        response !== null && typeof response === 'object' && Object.keys(response).length === 0;


    // Check if response is a served asset (file for now)
    const isResponseFile = (r: any) : boolean => !!r?.name;

    const responseObject = {
        data: dta,
        success: [200, 201, 202].includes(set.status),
        code: set.status,
        message: msg ?? (response != null ? 
            (response instanceof Object ? null : String(response)) 
            : 'No response'),
        error: null
    };
 
    return isResponseFile(response) ? response : responseObject;
};

export default customResponse;