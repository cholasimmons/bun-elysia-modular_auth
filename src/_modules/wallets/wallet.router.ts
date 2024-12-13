import Elysia, { t } from "elysia";
import { ViewWalletDTO, WalletController, WalletService } from ".";
import { checkAuth, checkForProfile, checkIsAdmin, checkIsStaff } from "~middleware/authChecks";
import { CreateWalletDTO, MakePaymentDTO, ViewWalletLiteDTO, WalletQueriesDTO } from "./wallet.model";
import { Currency } from "@prisma/client";

// const walletService = new WalletService();
const wallet = new WalletController();

export const WalletsRouter = new Elysia({ prefix: '/wallet',
    detail: { tags: ['Wallet']} // Swagger tag
 })

.onBeforeHandle([ checkAuth, checkForProfile]) // middleware

// .state('wallet',  {balance: 22.01, currency: Currency.ZMW, timestamp: new Date()})


    /* GET */

    // Fetch all User Wallets [STAFF]
    .get('/admin', wallet.getAll, {
        beforeHandle: [checkIsAdmin || checkIsStaff],
        query: t.Optional(WalletQueriesDTO),
        response: {
            200: t.Object({ data: t.Array(ViewWalletDTO), message: t.String() }),
            403: t.Object({ message: t.String({ default: 'Insufficient permission | Access denied' }) }),
            404: t.Object({ message: t.String({ default: 'Could not load wallets' }) }),
            500: t.Object({ message: t.String({ default: 'Something went wrong fetching the wallets' }) })
        }
    })

    // Get a single User's wallet by ID. [ADMIN]
    .get('/:profileId', wallet.getById, {
        beforeHandle: [checkIsAdmin || checkIsStaff],
        query: WalletQueriesDTO,
        params: t.Object({ profileId: t.String() }),
        response: {
            200: t.Object({ data: ViewWalletDTO, message: t.String({ default: 'Successfully loaded wallet' }) }),
            404: t.Object({ message: t.String({ default: 'No wallet found' }) }),
            500: t.Object({ message: t.String({ default: 'Something went wrong fetching the wallets' }) })
        }
    })

    // Get a single User's wallet by parameter :self
    .get('/', wallet.getMine, {
        beforeHandle: [],
        query: WalletQueriesDTO,
        // params: t.Object({ self: t.Boolean() }),
        response: {
            200: t.Object({ data: ViewWalletLiteDTO, message: t.String({ default: 'Successfully loaded wallet' }) }),
            206: t.Object({ message: t.String({ default: 'No wallet found' }) }),
            403: t.Object({ message: t.String({ default: 'Wallet is disabled' }) }),
            404: t.Object({ message: t.String({ default: 'Expected Parameter missing' }) }),
            500: t.Object({ message: t.String({ default: 'Error with wallet' }) })
        }
    })

    // Get wallet balance. [SELF]
    .get('/balance', wallet.checkBalance, {
        response: {
            200: t.Object({ data: t.Object({ currency: t.Enum(Currency), balance: t.Number() }), message: t.String({ default: 'Balance: (currency)(balance)' }) }),
            404: t.Object({ message: t.String({ default: 'Could not find wallet' }) }),
            500: t.Object({ message: t.String({ default: 'Unable to retrieve balance' }) })
        }
    })

    // Get a single User's wallet balance by their ID. [ADMIN]
    .get('/balance/:profileId', wallet.checkBalance, {
        beforeHandle: [checkIsAdmin || checkIsStaff],
        params: t.Object({ profileId: t.String() }),
        response: {
            200: t.Object({ data: t.Object({ currency: t.Enum(Currency), balance: t.Number() }), message: t.String({ default: 'Balance: (currency)(balance)' }) }),
            404: t.Object({ message: t.String({ default: 'Could not find wallet' }) }),
            500: t.Object({ message: t.String({ default: 'Unable to retrieve balance' }) })
        }
    })


    /* POST */


    // Create a new User Wallet (Must have profile) [SELF]
    .post('/', wallet.createWallet, {
        // body: t.Object(CreateWalletDTO),
        response: {
            201: t.Object({ data: ViewWalletDTO, message: t.String({ default: 'User Wallet successfully created' }) }),
            409: t.Object({ message: t.String({ default: 'Wallet already exists' }) }),
            500: t.Object({ message: t.String({ default: 'Unable to create new wallet' }) })
        }
    })

    // Create a new User Wallet (Must have profile) [ADMIN | STAFF]
    .post('/:profileId', wallet.createWallet, {
        beforeHandle: [checkIsAdmin || checkIsStaff],
        params: t.Object({ profileId: t.String() }),
        body: t.Object(CreateWalletDTO),
        response: {
            201: t.Object({ data: ViewWalletDTO, message: t.String({ default: 'User Wallet successfully created' }) }),
            409: t.Object({ message: t.String({ default: 'Wallet already exists' }) }),
            // 403: t.Object({ message: t.String({ default: 'Insufficient permission' }) }),
            500: t.Object({ message: t.String({ default: 'Unable to create new wallet' }) })
        }
    })

    // Pay a User [SELF]
    .post('/pay/:profileId', wallet.makePayment, {
        params: t.Object({ profileId: t.String() }),
        body: MakePaymentDTO,
        response: {
            200: t.Object({ data: ViewWalletLiteDTO, message: t.String({ default: `Payment to User was successful` }) }),
            409: t.Object({ message: t.String({ default: 'Insufficient balance in wallet' }) }),
            500: t.Object({ message: t.String({ default: 'Unable to make payment' }) })
        }
    })

    // Disable wallet [SYSTEM]
    .patch('/:profileId', wallet.lockWallet, {
        beforeHandle: [checkIsAdmin || checkIsStaff],
        params: t.Object({ profileId: t.String(), isActive: t.BooleanString({ default:false }) }),
        response: {
            204: t.Object({ data: t.Null(), message: t.String({ default: 'Successfully enabled/disabled wallet' }) }),
            500: t.Object({ message: t.String({ default: 'Error enabling/disabling wallet' }) })
        }
    })


    /* DELETE */


    // Get a single User's wallet by parameter :self
    .delete('/', wallet.deleteMyWallet, {
        beforeHandle: [],
        // query: WalletQueriesDTO,
        // params: t.Object({ self: t.Boolean() }),
        response: {
            200: t.Object({ data: t.Null(), message: t.String({ default: 'Successfully deleted wallet' }) }),
            206: t.Object({ message: t.String({ default: 'No wallet found' }) }),
            403: t.Object({ message: t.String({ default: 'Wallet is disabled' }) }),
            404: t.Object({ message: t.String({ default: 'Expected Parameter missing' }) }),
            500: t.Object({ message: t.String({ default: 'Error deleting wallet' }) })
        }
    })