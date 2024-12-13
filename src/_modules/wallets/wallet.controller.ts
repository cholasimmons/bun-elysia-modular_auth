import { HttpStatusEnum } from "elysia-http-status-code/status";
import { WalletService } from "~modules/wallets";
import { db } from "~config/prisma";
import { Currency, Wallet } from "@prisma/client";
import { NotFoundError } from "elysia";


export class WalletController {
    private walletService: WalletService;

    constructor(){
        this.walletService = new WalletService();
    }

    async getAll({ set, user, query: { transactions, userProfile } }: any):Promise<{data:Wallet[], message:string}|{message:string}>{

        try {
            const wallets: Wallet[] = await db.wallet.findMany({
                // where: { 
                //     userProfileId: user.userId,
                // },
                include: {
                    transactions: transactions ?? false,
                    userProfile: userProfile ?? false
                    // userProfile: { include: {
                    //     managedProperty: true,
                    //     ownedProperty: true,
                    //     user: { include: { role: true }},
                    // }},
                }
            })

            if(!wallets) {
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'Could not load wallets' };
            }

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: wallets, message: 'Successfully loaded wallets' };
        } catch (error) {
            console.error(error);
            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            return { message: 'Something went wrong fetching the wallets' };
        } 

        // const profile = await usersService.getProfileById(userSession.user.userId);
        // return walletService.get(ctx);
    }

    async getById({ set, params:{ paramProfileId }, query:{ transactions, userProfile } }: any){

        try {
            const wallet:Wallet|null = await this.walletService.getWalletByID(paramProfileId, transactions, userProfile)

            if(!wallet) {
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'No wallet found' };
            }
            
            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: wallet, message: 'Successfully loaded wallet' };
        } catch (error:any) {
            console.error(error);
            
            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: error.message };
        }
    }

    async getMine({ set, user:{ profileId }, query: { transactions, userProfile } }: any):Promise<{data:Wallet, message:string}|{message:string}>{

        try {
            const wallet: Wallet|null = await this.walletService.getWalletByID(profileId, transactions, userProfile)

            if(!wallet) {
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'No wallet found' };
            }

            if(!wallet.isActive) {
                set.status = HttpStatusEnum.HTTP_403_FORBIDDEN;
                return { message: `Your Wallet is disabled. ${wallet.isComment ?? ''}` };
            }

            
            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: wallet, message: 'Successfully retrieved your Wallet'};
        } catch (error:any) {
            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            console.error(error);
            return { message: 'Error with wallet. '+error.code.toString() }
        } 

        // const profile = await usersService.getProfileById(userSession.user.userId);
        // return walletService.get(ctx);
    }

    async checkBalance({ set, user:{ profileId }, params:{ paramProfileId }, body, state }:any):Promise<{data:{currency: Currency, balance:number}, message:string}|{message:string}>{
        const id = paramProfileId ?? profileId;

        try {
            const {balance, currency}: { balance: number; currency: Currency; } = await this.walletService.checkBalance(id);

            state = { wallet: { balance, currency, timestamp: Date.now() } };

            return { data: { currency, balance }, message: `Balance: ${currency}${balance}` }
            
        } catch (error: any) {
            console.error(error);

            if(error instanceof NotFoundError){
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND
                return { message: 'Could not find wallet' }
            }
            
            
            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            return { message: 'Unable to retrieve balance' }
        }
    }


    async createWallet({ set, user:{ profileId }, params:{ paramProfileId }, state }:any):Promise<{data: Wallet, message: string }|{message:string}>{
        const id = paramProfileId ?? profileId;

        try {
            const newWallet: Wallet|null = await this.walletService.create(id, {initialBalance: 0, currency: Currency.ZMW});

            if(!newWallet){
                throw 'Unable to create new wallet'
            };

            state = { wallet: { balance: newWallet.balance, currency: newWallet.currency, timestamp: Date.now() } };

            set.status = HttpStatusEnum.HTTP_201_CREATED;
            return { data: newWallet, message: `Wallet created: (${newWallet.currency} ${newWallet.balance})` };

        } catch (error:any) {
            console.error(error);

            if(error instanceof NotFoundError){
                set.status = HttpStatusEnum.HTTP_409_CONFLICT
                return { message:'Wallet already exists for this User' };
            }

            if(false){ // error instanceof PrismaClientKnownRequestError
                set.status = HttpStatusEnum.HTTP_409_CONFLICT
                return { message:'Unable to create new wallet. User already has a wallet.' };
            }
            
            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            return { message: 'Unable to create new wallet' }
        }
    }

    async createWalletWithBalance({ set, user:{ profileId }, params:{ paramProfileId }, body:{ initialBalance, currency } }:any){
        const id = paramProfileId ?? profileId;

        try {
            const newWallet: Wallet|null = await this.walletService.create(id, {initialBalance, currency: currency ?? Currency.ZMW});

            if(!newWallet){
                throw 'Unable to create new wallet'
            }

            set.status = HttpStatusEnum.HTTP_201_CREATED;
            return { data: newWallet, message: `Wallet created (Balance: ${newWallet.currency} ${newWallet.balance})` };

        } catch (error:any) {
            console.error(error);

            if(false){ // error instanceof PrismaClientKnownRequestError
                set.status = HttpStatusEnum.HTTP_409_CONFLICT
                return 'Unable to create new wallet. User already has a wallet.';
            }
            
            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            return { message: 'Unable to create new wallet' }
        }
    }

    async makePayment({ set, user, params:{ profileId }, body: { amount, discountCode, reference, currency, latitude, longitude }, payment }:any){
        console.debug(payment);
        
        try {
            const transaction = await this.walletService.makePayment( user.profileId, amount, discountCode, profileId, reference, longitude, latitude)

            set.status = HttpStatusEnum.HTTP_201_CREATED;
            return { data: transaction, message: `Payment of ${transaction.currency}${transaction.amount} successful`};
        } catch (error:any) {
            console.error(error);

            // if(error?.balance < amount){
            //     set.status = HttpStatusEnum.HTTP_409_CONFLICT;
            //     return { message: 'Insufficient balance in wallet' };
            // }
            
            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            return { message: 'Unable to make payment. '+error }
        }
    }

    async lockWallet({set, params:{paramProfileId, isActive}}:any) {
        const id = paramProfileId; // ?? profileId;

        try {
            const wallet:Wallet|null = await db.wallet.update({
                where: {
                    userProfileId: id
                },
                data: {
                    isActive
                }
            });

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: null, message: `Successfully ${isActive ? 'enabled' : 'disabled'} wallet` }

        } catch (error) {
            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: `Error ${isActive ? 'enabling' : 'disabling'} wallet` }
        }
    }

    async deleteMyWallet({set, user:{profileId}}:any) {
        try {
            await db.wallet.delete({
                where: {
                    userProfileId: profileId
                }
            });



            set.status = HttpStatusEnum.HTTP_200_OK;
            return { message: 'Successfully deleted wallet' }

        } catch (error) {
            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: 'Error deleting wallet' }
        }
    }
}