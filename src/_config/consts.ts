const consts = {
    server: {
        name: 'Hello World',
        author: 'Just.Chola',
        version: '0.4.4',
        email: 'info@simmons.studio'
    },
    api: {
        versionPrefix: `/v`,
        version: 1
    },
    auth: {
        name: 'lucia_auth',
        jwtMinAge: 1, // days
        jwtMaxAge: 7, // days
        maxSessions: 3,
        passwordMinLength: 8,
        method: 'X-Client-Type'
    },
    phone:{
        countryCode: 26,
        minLength: 9,
        maxLength: 11
    },
    transactions: {
        fee: 10
    },
    images:{
        main:{ width: 1280, height: 1280, quality: 84},
        thumbnail:{ width: 320, height: 320, quality: 55 },
        blurAmount: 9
    },
    websocket: {
        timeout: 7
    },
    verificationCode: {
        length: 6
    }
}

export default consts;