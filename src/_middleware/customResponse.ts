import Elysia from "elysia";

const customResponse = (({ error, response, set }: any) => {
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

    // Global vars to capture response data
    let msg: string|null = null;
    let err: string|null = null;
    let dta: any|null = null;
    let cde: number = 0;
    let ttl: number|null = null;
    let cnt: number|null = null;
    let pge: number|null = null;
    let nte: string|null = null;

    // Capture "message"  and "data" data from response
    msg = response?.message ?? null;
    err = response?.error ?? (error || error?.code ? error.code : error) ?? null;
    dta = response?.data ?? null;
    cde = response?.code ?? set.status;
    ttl = response?.total;
    cnt = response?.count;
    pge = response?.page;
    nte = response?.note;

    const responseObject:any = {
        data: dta,
        page: pge,
        count: cnt,
        total: ttl,
        success: [200, 201, 202].includes(cde),
        code: cde,
        message: msg ?? (response instanceof Object ? null : String(response)),
        error: err ?? nte ?? null
    };
 
    return responseObject;
    
});

export default customResponse;