import { HttpStatusEnum } from "elysia-http-status-code/status";
import { CouponService, ICreateCoupon } from ".";
import { db } from "~config/prisma";
import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { CasesService } from "~modules/cases";
import { Coupon } from "@prisma/client";

export class CouponController {
    private coupon: CouponService;

    constructor(){
        this.coupon = new CouponService();
    }

    async getMyCoupons({ set, user: { profileId } }: any){

        try {

            const coupons = await db.coupon.findMany({
                where: { 
                    ownerProfileId: profileId,
                }
            })

            if(!coupons || coupons.length < 1) {
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'You do not own any coupons' };
            }
        
            // Lighten the return object
            // const couponsLite = coupons.map((coupon: ICoupon) => {
            //     return {
            //         id: coupon.id,
            //         ownerProfileId: coupon.ownerProfileId
            //     }}
            // )
            
            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: coupons, message: `Successfully retrieved ${coupons.length} of your Coupons` };
        } catch (error) {
            console.error(error);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            return { message: 'Could not retrieve your Coupons' }
        }
    }

    async getAllCoupons({ set, params:{ isActive } }: any){

        try {
            const coupons: Coupon[]|null = await this.coupon.getAllCouponsAsAdmin({ isActive })

            if(!coupons || coupons.length < 1) {
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'Could not retrieve Coupons' };
            }
            
            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: coupons, message: `Successfully retrieved ${coupons.length} Coupons` };
        } catch (error) {
            console.error(error);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            return { message: 'Could not retrieve Coupons' }
        }
    }

    async getCouponByCode({ set, user, params: {code} }: any){
        const { profileId } = user;

        try {
            const coupon = await this.coupon.getCouponByCode(code, profileId)

            if(!coupon) {
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'No coupon with that code was found' };
            }
            
            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: coupon, message: 'Successfully retrieved Coupon' };
        } catch (error:any) {
            console.error(error);
            
            set.status = error.code && HttpStatusEnum.HTTP_404_NOT_FOUND;
            return error.message;
        }
    }

    async getCouponByCodeAsAdmin({ set, params: {code} }: any){
        try {
            const coupon = await this.coupon.getCouponByCode(code)

            if(!coupon) {
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'No coupon with that code was found' };
            }
            
            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: coupon, message: 'Successfully retrieved Users\' Coupon' };
        } catch (error:any) {
            console.error(error);
            
            set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
            return { message: error.message ?? 'Could not retrieve Users\' Coupon' };
        }
    }

    async getUsersCoupons({ set, params: {profileId} }: any){
        try {
            const coupons: Coupon[]|null = await this.coupon.getCouponsByUserProfileId(profileId)

            if(!coupons) {
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'No coupons found on that User' };
            }
            
            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: coupons, message: 'Successfully retrieved Users\' Coupons' };
        } catch (error:any) {
            console.error(error);
            
            set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
            return { message: error.message ?? 'Could not retrieve Coupons' };
        }
    }

    async createCoupon({ set, user: { profileId }, query, body:{ code, name, discount, discountType, expiresAt, maxUses } }:any){

        console.log("Creating coupon...");
        console.log(new Date());

        try {
            const payload: ICreateCoupon = {
                code: code,
                name: name,
                discount: discount,
                discountType: discountType,
                expiresAt: expiresAt ?? null,
                maxUses: maxUses
            }
            const newCoupon: Coupon|null = await this.coupon.createCoupon(profileId!, payload, { usedBy: query?.usedBy })

            set.status = HttpStatusEnum.HTTP_201_CREATED;
            return { data: newCoupon, message: 'Successfully created Coupon' };
        } catch (error) {
            console.error(error);

            if(error instanceof PrismaClientKnownRequestError && error.code === 'P2002'){
                set.status = HttpStatusEnum.HTTP_409_CONFLICT
                return { message: `Coupon Code ${code} already taken.` };
            }

            if(error instanceof PrismaClientValidationError){
                set.status = HttpStatusEnum.HTTP_409_CONFLICT
                return { message: 'A validation error occurred.' };
            }

            if(error instanceof PrismaClientUnknownRequestError){
                set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
                return { message: 'Error persisting data.' };
            }
            
            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            return { message: 'Unable to create Coupon.' }
        }
    }

    async useCoupon({ set, user, body }:any){
        const { profileId } = user;

        try {
            const coupon = await this.coupon.useCoupon(profileId, body.code);

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: coupon, message: '...' };
        } catch (error) {
            console.error(error);
            
            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: 'Could not use this coupon' };
        }
    }

}