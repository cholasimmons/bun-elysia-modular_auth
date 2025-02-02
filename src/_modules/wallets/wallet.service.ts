import { db } from "~config/prisma";
// import type { IWallet } from "~modules/wallet";
import { constants } from "~config/constants";
import { Coupon, Currency, DiscountType, Prisma, TransactionStatus, Wallet, WalletTransaction } from "@prisma/client";
import { NotFoundError } from "elysia";

export class WalletService {
    private static _instance: WalletService;

    private constructor(){
        console.info("|| WalletService is GO");
    }

    default(){
        return 'Wallet Service';
    }

    public static get instance(): WalletService {
        if (!WalletService._instance) {
            WalletService._instance = new WalletService();
        }
        return WalletService._instance;
    }

    // Check balance of wallet by User Profile ID
    async checkBalance(profileId: string, opts?:{currency: Currency}):Promise<{balance:number; currency:Currency}>{
        try {
            const wallet:Wallet|null = await db.wallet.findUnique({
                where: {
                    userProfileId: profileId,
                    isActive: true
                }
            });

            if(!wallet){
                throw new NotFoundError('Could not find wallet')
            }

            return { balance: Number(wallet.balance), currency: wallet.currency}
        } catch (error) {
            console.error(error);

            throw error;
        }
    }

    // Create a new wallet
    async create(userProfileId: string, query?:{initialBalance:number, currency: Currency}): Promise<Wallet|null> {
        try {
            // await db.profile.update({
            //     where: { id: profileId },
            //     data: {
            //         wallet: {
            //             create: {
            //                 userProfileId: profileId,
            //                 currency: opts?.currency ?? Currency.ZMW,
            //                 // balance: 0 // added to DB by default
            //             }
            //         }
            //     }
            // })
            const exists: Partial<Wallet>|null = await db.wallet.findFirst({
                where: {
                    userProfileId: userProfileId
                },
                select: { id: true }
            });

            if(exists){
                throw new NotFoundError('You already have a Wallet')
            }

            const wallet: Wallet|null = await db.wallet.create({
                data: {
                    userProfileId: userProfileId,
                    currency: query?.currency ?? Currency.ZMW,
                    balance: query?.initialBalance ?? 0.00
                },
                include: { transactions:false, userProfile:false },
            });
            return wallet;
        } catch (error) {
            console.error("Wallet service. ",error);
            
            throw "Unable to create wallet"
        }
    }


    // Retrieve a Wallet by ID
    async getWalletByID(userProfileId: string, query?:{ transactions?: boolean, profile?: boolean }) {
        
        return db.wallet.findUnique({
            where: {
                userProfileId: userProfileId
            },
            include: {
                transactions: query?.transactions ?? false,
                userProfile: query?.profile ?? false,
            }
        });
    }


    async makePayment(userProfId: string, amountToPay: number, discountCode: string, payeeProfileId: string, reference?: string, latitude?: number, longitude?:number) {

        const transactionFee = constants.transactions.fee;

        try {
            return db.$transaction(async (tx) => {
                const wallet: Wallet|null = await tx.wallet.findUnique({
                    where: {
                        userProfileId: userProfId
                    },
                    // include: { transactions: true }
                });
                
                // Make call to external platform if payment is off premise
                if(!wallet) throw new NotFoundError('No wallet found for that User'); // ${userProfId}`;

                let discountObj: Coupon|null|any;
                if(discountCode){
                    // find out amount of discount via discountCode
                    discountObj = await tx.coupon.findFirst({ where: { code: discountCode },
                        select: {
                            discount: true,
                            discountType: true,
                            expiresAt: true,
                            maxUses: true,
                            usedBy: true
                        }});

                    if(!discountObj){
                        throw `${discountCode} is not a valid Discount Code`;
                    }
                }

                // TODO: Fix this as expiresAt could be limitless
                let nowNumber = Date.now();
                const now = new Date(nowNumber);
                if(discountObj.usedBy.length >= discountObj.maxUses || now >= (discountObj.expiresAt ?? now)){
                    throw new NotFoundError(`Discount Code no longer valid`);
                }

                // Calculate discount from discountCode (coupon)
                const discount = discountObj?.discount ?? 0;
                const bill = (amountToPay + transactionFee);
                const discountValue = (discountObj.discountType === DiscountType.FLAT ? discount : bill * discount);
                const totalBill = bill - discountValue;

                if(Number(totalBill) > Number(wallet.balance)) {
                    throw {balance: `Insufficient balance in wallet. ${wallet.currency}${wallet.balance}` };
                }
                
                let transaction: WalletTransaction = await tx.walletTransaction.create({
                    // where: { userProfileId: userProfileId},
                    data: {
                        // payerWalletId: wallet.id,
                        payerProfileId: userProfId,
                        payeeProfileId: payeeProfileId,
                        amount: totalBill,
                        transactionFee: constants.transactions.fee,
                        currency: wallet.currency,
                        reference: reference ?? null,
                        longitude: longitude ?? null,
                        latitude: latitude ?? null,
                        discount: discountValue ?? 0,
                        discountCode: discountCode,
                        status: TransactionStatus.PENDING
                    }
                });

                const totalBalance = (Number(wallet.balance) - totalBill)

                await tx.wallet.update({
                    data: { balance: totalBalance },
                    where: { userProfileId: userProfId  },
                    // include: { transactions: true }
                })
                
                transaction = await tx.walletTransaction.update({
                    where: { id: transaction.id },
                    data: { status: TransactionStatus.SUCCESS}
                })

                return transaction;
            },
            {
                maxWait: 5000,
                timeout: 10000,
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
            });
            
        } catch (error) {
            console.warn(error);
            
            throw error;
        }
    }
}