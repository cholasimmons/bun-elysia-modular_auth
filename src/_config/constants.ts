const constants = {
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
        timeout: 15
    },
    verificationCode: {
        length: 6
    }
}


const RedisEvents = {
    USER: 'user',
    USER_LOGIN: 'user:login',
    USER_LOGOUT: 'user:logout',
    USER_REGISTER: 'user:register',
    USER_DELETE: 'user:delete',
    USER_NEW_PROFILE: 'user:new-profile',
    SYSTEM: 'system',
    SYSTEM_START: 'system:start',
    WALLET: 'wallet',
    WALLET_PAID: 'wallet:paid',
    WALLET_FUNDED: 'wallet:funded',
    COUPON: 'coupon',
    COUPON_USED: 'coupon:used',
    MESSAGE: 'message',
    MESSAGE_SENT: 'message:sent',
    PASSWORD_RESET: 'user:password_reset',
    EMAIL_VERIFIED: 'user:email_verified',
}

const RedisKeys = {
    USER_SESSION: (userId: string) => `session:user:${userId}`,
    USER_PROFILE: (userId: string) => `profile:user:${userId}`,
    USER: (userId: string) => `user:${userId}`,
    OTP_CODE: (email: string) => `otp:${email}`,
    RATE_LIMIT: (ip: string) => `ratelimit:${ip}`,
    COOLDOWN: (id: string) => `message-cooldown:${id}`
};

export { constants, RedisEvents, RedisKeys };