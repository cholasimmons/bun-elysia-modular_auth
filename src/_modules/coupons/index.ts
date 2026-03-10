import Elysia, { t } from "elysia";
import {
  checkAuth,
  checkForProfile,
  checkIsAdmin,
  checkIsStaff,
} from "~middleware/authChecks";
import { CouponService } from "./coupon.service";
import { ICreateCoupon, QueriesModel } from "./coupon.model";
import { swaggerDetails } from "~utils/response_helper";
import { prismaSearch } from "~config/prisma";
import {
  CouponPlain,
  CouponPlainInputCreate,
} from "@generated/prismabox/Coupon";
import { Coupon } from "@generated/prisma/client";
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "@generated/prisma/internal/prismaNamespace";

export const CouponsRouter = new Elysia({
  prefix: "/coupons",
  detail: { description: "Coupon management", tags: ["Coupons"] },
})

  .onBeforeHandle([checkAuth, checkForProfile])

  /* GET */

  .get(
    "/",
    async ({ status, set, user: { profileId }, query }: any) => {
      const { usedBy } = query;
      const { page, limit, sortBy, sortOrder, searchField, search } = query;
      const searchOptions = {
        page,
        limit,
        sortBy: { field: sortBy ?? "createdAt", order: sortOrder },
        search: { field: searchField ?? "code", value: search },
        include: { usedBy },
      };

      try {
        const coupons = await prismaSearch("coupon", searchOptions);
        // const coupons = await db.coupon.findMany({
        //     where: {
        //         ownerProfileId: profileId
        //     }
        // })

        if (!coupons.data || coupons.total < 1) {
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          return status(404, { message: "You do not own any coupons" });
        }

        // Lighten the return object
        // const couponsLite = coupons.map((coupon: ICoupon) => {
        //     return {
        //         id: coupon.id,
        //         ownerProfileId: coupon.ownerProfileId
        //     }}
        // )

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: coupons,
          message: `Successfully retrieved ${coupons.total} of your Coupons`,
        });
      } catch (error) {
        console.error(error);

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
        return status(500, { message: "Could not retrieve your Coupons" });
      }
    },
    {
      response: {
        200: t.Object({
          data: t.Array(CouponPlain),
          message: t.String({
            default: "Successfully retrieved 0 of your Coupons",
          }),
        }),
        404: t.Object({
          message: t.String({ default: "You do not own any coupons" }),
        }),
        500: t.Object({
          message: t.String({ default: "Could not retrieve your Coupons" }),
        }),
      },
      detail: swaggerDetails(
        "Get used Coupons [SELF]",
        "Retrieve all of User's used Coupons. [SELF]",
      ),
    },
  )

  .get(
    "/admin",
    async ({ status, set, params: { isActive } }) => {
      try {
        const coupons: Coupon[] | null =
          await CouponService.getAllCouponsAsAdmin({ isActive });

        if (!coupons || coupons.length < 1) {
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          return status(404, { message: "Could not retrieve Coupons" });
        }

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: coupons,
          message: `Successfully retrieved ${coupons.length} Coupons`,
        });
      } catch (error) {
        console.error(error);

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
        return status(500, { message: "Could not retrieve Coupons" });
      }
    },
    {
      beforeHandle: [checkIsAdmin || checkIsStaff],
      params: t.Object({ isActive: t.BooleanString() }),
      query: QueriesModel.coupon,
      response: {
        200: t.Object({
          data: t.Array(CouponPlain),
          message: t.String({
            default: "Successfully retrieved 0 of your Coupons",
          }),
        }),
        404: t.Object({
          message: t.String({ default: "Could not retrieve Coupons" }),
        }),
        500: t.Object({
          message: t.String({ default: "Could not retrieve Coupons" }),
        }),
      },
      detail: swaggerDetails(
        "Get all Coupons [ADMIN|STAFF]",
        "Retrieve all Coupons in the system",
      ),
    },
  )

  // @ts-ignore

  .get(
    "/:code",
    async ({ status, set, user, params: { code } }: any) => {
      const { profileId } = user;

      try {
        const coupon = await CouponService.getCouponByCode(code, profileId);

        if (!coupon) {
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          return status(404, { message: "No coupon with that code was found" });
        }

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: coupon,
          message: "Successfully retrieved Coupon",
        });
      } catch (error: any) {
        console.error(error);

        // set.status = error.code || HttpStatusEnum.HTTP_404_NOT_FOUND;
        return status(404, { message: error.message });
      }
    },
    {
      response: {
        200: t.Object({
          data: CouponPlain,
          message: t.String({ default: "Successfully retrieved Coupon" }),
        }),
        404: t.Object({
          message: t.String({ default: "No coupon with that code was found" }),
        }),
        500: t.Object({
          message: t.String({ default: "Could not retrieve your Coupons" }),
        }),
      },
      detail: swaggerDetails(
        "Get My Coupon by Code",
        "Retrieve specific Coupon by it's code.",
      ),
    },
  )

  .get(
    "/profileId/:profileId",
    async ({ status, set, params: { profileId } }) => {
      try {
        const coupons: Coupon[] | null =
          await CouponService.getCouponsByUserProfileId(profileId);

        if (!coupons) {
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          return status(404, { message: "No coupons found on that User" });
        }

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: coupons,
          message: "Successfully retrieved Users' Coupons",
        });
      } catch (error: any) {
        console.error(error);

        // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
        return status(404, {
          message: error.message ?? "Could not retrieve Coupons",
        });
      }
    },
    {
      beforeHandle: [checkIsAdmin || checkIsStaff],
      response: {
        200: t.Object({
          data: t.Array(CouponPlain),
          message: t.String({ default: "Successfully retrieved Coupons" }),
        }),
        404: t.Object({
          message: t.String({ default: "No coupons found on that User" }),
        }),
        500: t.Object({
          message: t.String({ default: "Could not retrieve Coupons" }),
        }),
      },
      detail: swaggerDetails(
        "Get User's Coupons by Profile ID [STAFF]",
        "Retrieve a specific Coupon by it's code.",
      ),
    },
  )

  .get(
    "/admin/:code",
    async ({ status, set, params: { code } }) => {
      try {
        const coupon = await CouponService.getCouponByCode(code);

        if (!coupon) {
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          return status(404, { message: "No coupon with that code was found" });
        }

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: coupon,
          message: "Successfully retrieved Users' Coupon",
        });
      } catch (error: any) {
        console.error(error);

        // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
        return status(404, {
          message: error.message ?? "Could not retrieve Users' Coupon",
        });
      }
    },
    {
      beforeHandle: [checkIsStaff || checkIsAdmin],
      response: {
        200: t.Object({
          data: CouponPlain,
          message: t.String({ default: "Successfully retrieved Coupon" }),
        }),
        404: t.Object({
          message: t.String({ default: "No coupon with that code was found" }),
        }),
        500: t.Object({
          message: t.String({ default: "Could not retrieve your Coupons" }),
        }),
      },
      detail: swaggerDetails(
        "Get Coupon by Code [STAFF]",
        "Retrieve a specific Coupon by it's code.",
      ),
    },
  )

  .get("/", "Coupon OK")

  /* POST */

  .post(
    "/",
    async ({
      status,
      set,
      user: { profileId },
      query,
      body: { code, name, discount, discountType, expiresAt, maxUses },
    }: any) => {
      console.log("Creating coupon...");
      console.log(new Date());

      try {
        const payload: ICreateCoupon = {
          code: code,
          name: name,
          discount: discount,
          discountType: discountType,
          expiresAt: expiresAt ?? null,
          maxUses: maxUses,
        };
        const newCoupon: Coupon | null = await CouponService.createCoupon(
          profileId!,
          payload,
          { usedBy: query?.usedBy },
        );

        // set.status = HttpStatusEnum.HTTP_201_CREATED;
        return status(201, {
          data: newCoupon,
          message: "Successfully created Coupon",
        });
      } catch (error) {
        console.error(error);

        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          // set.status = HttpStatusEnum.HTTP_409_CONFLICT
          return status(409, { message: `Coupon Code ${code} already taken.` });
        }

        if (error instanceof PrismaClientValidationError) {
          // set.status = HttpStatusEnum.HTTP_409_CONFLICT
          return status(409, { message: "A validation error occurred." });
        }

        if (error instanceof PrismaClientUnknownRequestError) {
          // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
          return status(500, { message: "Error persisting data." });
        }

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
        return status(500, { message: "Unable to create Coupon." });
      }
    },
    {
      // beforeHandle: [ checkIsAdmin || checkIsStaff ],
      body: CouponPlainInputCreate,
      query: QueriesModel.coupon,
      response: {
        201: t.Object({
          data: CouponPlain,
          message: t.String({ default: "Successfully created Coupon" }),
        }),
        403: t.Object({
          message: t.String({
            default: "Cannot create a coupon without owning a User Profile",
          }),
        }),
        500: t.Object({
          message: t.String({ default: "Unable to create Coupon" }),
        }),
      },
      detail: swaggerDetails(
        "Create Coupon",
        "Creates a 4 to 8 digit coupon code (The only way to offer a discount)",
      ),
    },
  )

  .post(
    "/use",
    async ({ status, set, user, body }: any) => {
      const { profileId } = user;

      try {
        const coupon = await CouponService.useCoupon(profileId, body.code);

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, { data: coupon, message: "..." });
      } catch (error) {
        console.error(error);

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
        return status(500, { message: "Could not use this coupon" });
      }
    },
    {
      body: t.Object({ code: t.String() }),
      response: {
        200: t.Object({ data: CouponPlain, message: t.String() }),
        500: t.Object({ message: t.String() }),
      },
      detail: swaggerDetails("Use Coupon", "Utilize Coupon by Code"),
    },
  );
