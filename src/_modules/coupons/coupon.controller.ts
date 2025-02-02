import { HttpStatusEnum } from "elysia-http-status-code/status";
import { CouponService, ICreateCoupon } from ".";
import { db, prismaSearch } from "~config/prisma";
import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { Coupon } from "@prisma/client";

export class CouponController {
    private couponService: CouponService;

    constructor(){
        this.couponService = CouponService.instance;
    }
    

    getMyCoupons = async({ set, user: { profileId }, query }: any) => {
        const { usedBy } = query;
        const { page, limit, sortBy, sortOrder, searchField, search } = query;
        const searchOptions = {
            page, limit,
            sortBy: { field: sortBy ?? 'createdAt', order: sortOrder },
            search: { field: searchField ?? 'code', value: search},
            include: { usedBy }
        }

        try {
            const coupons = await prismaSearch('coupon', searchOptions);
            // const coupons = await db.coupon.findMany({
            //     where: { 
            //         ownerProfileId: profileId
            //     }
            // })

            if(!coupons.data || coupons.total < 1) {
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
            return { data: coupons, message: `Successfully retrieved ${coupons.total} of your Coupons` };
        } catch (error) {
            console.error(error);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            return { message: 'Could not retrieve your Coupons' }
        }
    }

    getAllCoupons = async({ set, params:{ isActive } }: any) => {

        try {
            const coupons: Coupon[]|null = await this.couponService.getAllCouponsAsAdmin({ isActive })

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

    getCouponByCode = async({ set, user, params: {code} }: any) => {
        const { profileId } = user;

        try {
            const coupon = await this.couponService.getCouponByCode(code, profileId)

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

    getCouponByCodeAsAdmin = async({ set, params: {code} }: any) => {
        try {
            const coupon = await this.couponService.getCouponByCode(code)

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

    getUsersCoupons = async({ set, params: {profileId} }: any) => {
        try {
            const coupons: Coupon[]|null = await this.couponService.getCouponsByUserProfileId(profileId)

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

    createCoupon = async({ set, user: { profileId }, query, body:{ code, name, discount, discountType, expiresAt, maxUses } }:any) => {

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
            const newCoupon: Coupon|null = await this.couponService.createCoupon(profileId!, payload, { usedBy: query?.usedBy })

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

    useCoupon = async({ set, user, body }:any) => {
        const { profileId } = user;

        try {
            const coupon = await this.couponService.useCoupon(profileId, body.code);

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: coupon, message: '...' };
        } catch (error) {
            console.error(error);
            
            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: 'Could not use this coupon' };
        }
    }

}