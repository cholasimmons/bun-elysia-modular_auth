import { db } from "~config/prisma";
import { Coupon } from "@prisma/client";
import { ICreateCoupon } from "./coupon.model";

export class CouponService {
    private static _instance: CouponService;

    private constructor(){
        console.info("|| CouponService is GO");
    }
    
    default(){
        return 'Coupon Service';
    }

    public static get instance(): CouponService {
        if (!CouponService._instance) {
            CouponService._instance = new CouponService();
        }
        return CouponService._instance;
    }

    // Create a new coupon
    async createCoupon(profileId: string, body: ICreateCoupon, query?:{ usedBy?:boolean }): Promise<Coupon> {
        const { code, name, discount, discountType, expiresAt, maxUses } = body;

        try {
            const coupon: Coupon|null = await db.coupon.create({
                data: {
                    ownerProfileId: profileId,
                    code: code,
                    name: name,
                    discount: discount,
                    discountType: discountType,
                    expiresAt: expiresAt,
                    maxUses: maxUses
                },
                include: {
                    usedBy: query?.usedBy ?? false,
                }
            });
            
            return coupon;
        } catch (error) {
            throw error
        }
    };


    // Retrieve a Coupon by it's code
    async getCouponByCode(couponCode: string, profileId?:string) {
        return db.coupon.findFirst({
            where: {
                code: couponCode,
                // ownerProfileId: profileId ?? undefined
                usedBy: {
                    every: { id: profileId }
                }
            }
        });
    }


    // Retrieve a User's Coupons by their Profile ID [ADMIN | STAFF]
    async getCouponsByUserProfileId(profileId:string) {
        return db.coupon.findMany({
            where: {
                // ownerProfileId: profileId,
                usedBy: {
                    every: { id: profileId }
                }
            }
        });
    }


    // Retrieve a User's Coupons by their Profile ID [ADMIN | STAFF]
    async getAllCouponsAsAdmin(params?:{ isActive:boolean }) {
        return db.coupon.findMany({
            where: {
                isActive: params?.isActive
            }
        });
    }


    // Use a coupon
    async useCoupon(profileId: string, code: string): Promise<Coupon> {

        try {
            const coupon = await db.coupon.findUnique({
                where: { code: code },
                include: { usedBy: true },
            });

            if(!coupon) {
                throw `Coupon: ${code} not found`
            }

            if(coupon.usedBy.length === coupon.maxUses){
                throw `Coupon maximum usage limit reached (${coupon.maxUses})`
            }

            const userProfile = await db.profile.findUnique({
                where: { id: profileId }
            })

            if(!userProfile){
                throw 'No User Profile found'
            }

            const updatedCoupon = await db.coupon.update({
                where: { code: code },
                data: {
                    usedBy: {
                        connect: {
                            id: userProfile.id
                        }
                    }
                }
            })
            
            return updatedCoupon;
        } catch (error) {
            throw "Unable to create coupon"
        }
    };
}