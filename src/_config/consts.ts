const consts = {
    server: {
        name: 'Hello World',
        author: 'Just.Chola',
        version: '0.4.1',
        email: 'info@simmons.studio'
    },
    api: {
        versionPrefix: `/v`,
        version: 1
    },
    auth: {
        name: 'lucia_auth',
        jwtMaxAge: 7,
        maxSessions: 2,
        passwordMinLength: 8,
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