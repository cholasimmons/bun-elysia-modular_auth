// @ts-nocheck

import Elysia, { t } from "elysia";
import { checkAuth, checkForProfile, checkIsAdmin, checkIsStaff } from "~middleware/authChecks";
import { CouponController, CouponService, ViewCouponDTO } from ".";
import { CouponQueriesDTO, CreateCouponDTO } from "./coupon.model";
import { swaggerDetails } from "~utils/response_helper";

// const couponService = new CouponService();
const coupons = new CouponController();

export const CouponsRouter = new Elysia({ prefix: '/coupons',
    detail: { description:'Coupon management', tags: ['Coupons'] }
})

    .onBeforeHandle([checkAuth, checkForProfile])

    /* GET */

    .get('/', coupons.getMyCoupons, {
        response: {
            200: t.Object({ data: t.Array(ViewCouponDTO), message: t.String({ default: 'Successfully retrieved 0 of your Coupons' }) }),
            404: t.Object({ message: t.String({ default: 'You do not own any coupons' }) }),
            500: t.Object({ message: t.String({ default: 'Could not retrieve your Coupons' }) })
        },
        detail: swaggerDetails('Get used Coupons [SELF]', 'Retrieve all of User\'s used Coupons. [SELF]')
    })

    .get('/admin', coupons.getAllCoupons, {
        beforeHandle: [checkIsAdmin || checkIsStaff],
        // params: t.Object({  }),
        query: CouponQueriesDTO,
        response: {
            200: t.Object({ data: t.Array(ViewCouponDTO), message: t.String({ default: 'Successfully retrieved 0 of your Coupons' }) }),
            404: t.Object({ message: t.String({ default: 'Could not retrieve Coupons' }) }),
            500: t.Object({ message: t.String({ default: 'Could not retrieve Coupons' }) })
        },
        detail: swaggerDetails('Get all Coupons [ADMIN|STAFF]', 'Retrieve all Coupons in the system')
    })

    // @ts-ignore

    .get('/:code', coupons.getCouponByCode, {
        response: {
            200: t.Object({ data: ViewCouponDTO, message: t.String({ default: 'Successfully retrieved Coupon' }) }),
            404: t.Object({ message: t.String({ default: 'No coupon with that code was found' }) }),
            500: t.Object({ message: t.String({ default: 'Could not retrieve your Coupons' }) }),
        },
        detail: swaggerDetails('Get My Coupon by Code', 'Retrieve specific Coupon by it\'s code.')
    })

    .get('/profileId/:profileId', coupons.getUsersCoupons, {
        beforeHandle: [checkIsAdmin || checkIsStaff],
        response: {
            200: t.Object({ data: ViewCouponDTO, message: t.String({ default: 'Successfully retrieved Coupons' }) }),
            404: t.Object({ message: t.String({ default: 'No coupons found on that User' }) }),
            500: t.Object({ message: t.String({ default: 'Could not retrieve Coupons' }) }),
        },
        detail: swaggerDetails('Get User\'s Coupons by Profile ID [STAFF]', 'Retrieve a specific Coupon by it\'s code.')
    })

    .get('/admin/:code', coupons.getCouponByCodeAsAdmin, {
        beforeHandle: [ checkIsStaff || checkIsAdmin ],
        response: {
            200: t.Object({ data: ViewCouponDTO, message: t.String({ default: 'Successfully retrieved Coupon' }) }),
            404: t.Object({ message: t.String({ default: 'No coupon with that code was found' }) }),
            500: t.Object({ message: t.String({ default: 'Could not retrieve your Coupons' }) }),
        },
        detail: swaggerDetails('Get Coupon by Code [STAFF]', 'Retrieve a specific Coupon by it\'s code.')
    })


    /* POST */


    .post('/', coupons.createCoupon, {
        // beforeHandle: [ checkIsAdmin || checkIsStaff ],
        body: CreateCouponDTO,
        query: CouponQueriesDTO,
        response: {
            201: t.Object({ data: ViewCouponDTO, message: t.String({ default: 'Successfully created Coupon' }) }),
            403: t.Object({ message: t.String({ default: 'Cannot create a coupon without owning a User Profile' }) }),
            500: t.Object({ message: t.String({ default: 'Unable to create Coupon' }) }),
        },
        detail: swaggerDetails('Create Coupon', 'Creates a 4 to 8 digit coupon code (The only way to offer a discount)')
    })

    .post('/use', coupons.useCoupon, {
        body: t.Object({ code: t.String()}),
        response: {
            // 200: (CouponDTO),
            500: t.String()
        },
        detail: swaggerDetails('Use Coupon', 'Utilize Coupon by Code')
    });