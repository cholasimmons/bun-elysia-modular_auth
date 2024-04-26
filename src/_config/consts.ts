const consts = {
    server: {
        name: 'Hello World',
        author: 'Just.Chola',
        version: '0.1.0',
        passwordMinLength: 8,
        maxSessions: 2,
        cookieName: 'lucia-auth',
        email: 'info@simmons.studio'
    },
    api: {
        versionPrefix: `/v`,
        version: 1
    },
    websocket: {
        timeout: 7
    },
    verificationCode: {
        length: 6
    }
}

export default consts;