const consts = {
    server: {
        name: 'Hello World',
        author: 'Just.Chola',
        version: '0.3.0',
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
    websocket: {
        timeout: 7
    },
    verificationCode: {
        length: 6
    }
}

export default consts;