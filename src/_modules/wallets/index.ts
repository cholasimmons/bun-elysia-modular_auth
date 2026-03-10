import Elysia, { t } from "elysia";
import { WalletService } from "./wallet.service";
import {
  checkAuth,
  checkForProfile,
  checkIsAdmin,
  checkIsStaff,
} from "~middleware/authChecks";
import {
  MakePaymentDTO,
  ViewWalletLiteDTO,
  QueriesModel,
  WalletWithOptionalChildren,
} from "./wallet.model";
import { Currency, Wallet } from "@generated/prisma/client";
import { db } from "~config/prisma";
import {
  WalletPlain,
  WalletPlainInputCreate,
} from "@generated/prismabox/Wallet";
import { Pagination } from "~modules/root/root.models";
import { WalletTransactionPlain } from "@generated/prismabox/WalletTransaction";
import { ProfilePlain } from "@generated/prismabox/Profile";
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "~exceptions/custom_errors";
import { HttpStatusEnum } from "elysia-http-status-code/status";

export const WalletsRouter = new Elysia({
  prefix: "/wallet",
  detail: { tags: ["Wallet"] }, // Swagger tag
})

  .onBeforeHandle([checkAuth, checkForProfile]) // middleware

  // .state('wallet',  {balance: 22.01, currency: Currency.ZMW, timestamp: new Date()})

  /* GET */

  // Fetch all User Wallets [STAFF]
  .get(
    "/admin",
    async ({ status, set, user, query }: any) => {
      const { transactions, profile } = query;
      const { page, limit, sortBy, sortOrder, searchField, search } = query;
      const searchOptions = {
        page,
        limit,
        sortBy: { field: sortBy ?? "createdAt", order: sortOrder },
        search: { field: searchField ?? "balance", value: search },
        include: { transactions, profile },
      };

      try {
        const wallets: WalletWithOptionalChildren[] | null =
          await db.wallet.findMany({
            // where: {
            //     userProfileId: user.userId,
            // },
            include: {
              transactions: transactions ?? false,
              userProfile: profile ?? false,
              // userProfile: { include: {
              //     managedProperty: true,
              //     ownedProperty: true,
              //     user: { include: { role: true }},
              // }},
            },
          });

        if (!wallets) {
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          return status(404, { message: "Could not load wallets" });
        }

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: wallets,
          message: "Successfully loaded wallets",
        });
      } catch (error) {
        // console.error(error);

        // throw error;

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
        return status(500, {
          message: "Something went wrong fetching the wallets",
        });
      }

      // const profile = await usersService.getProfileById(userSession.user.userId);
      // return walletService.get(ctx);
    },
    {
      beforeHandle: [checkIsAdmin || checkIsStaff],
      query: t.Intersect([Pagination.options, QueriesModel.wallet]),
      response: {
        200: t.Object({
          data: t.Object({
            ...WalletPlain.properties,
            transactions: t.Optional(t.Array(WalletTransactionPlain)),
            userProfile: t.Optional(t.Array(ProfilePlain)),
          }),
          message: t.String(),
        }),
        403: t.Object({
          message: t.String({
            default: "Insufficient permission | Access denied",
          }),
        }),
        404: t.Object({
          message: t.String({ default: "Could not load wallets" }),
        }),
        500: t.Object({
          message: t.String({
            default: "Something went wrong fetching the wallets",
          }),
        }),
      },
    },
  )

  // Get a single User's wallet by ID. [ADMIN]
  .get(
    "/:profileId",
    async ({
      status,
      set,
      params: { profileId },
      query: { transactions, profile },
    }) => {
      try {
        const wallet: WalletWithOptionalChildren | null =
          await WalletService.getWalletByID(profileId, {
            transactions,
            profile,
          });

        if (!wallet) {
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          return status(404, { message: "No wallet found" });
          // throw new NotFoundError("No wallet found");
        }

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: wallet,
          message: "Successfully loaded wallet",
        });
      } catch (error: any) {
        console.error(error);

        throw error;

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
        // return { message: error.message };
      }
    },
    {
      beforeHandle: [checkIsStaff || checkIsAdmin],
      query: QueriesModel.wallet,
      params: t.Object({ profileId: t.String() }),
      response: {
        200: t.Object({
          data: WalletPlain,
          message: t.String({ default: "Wallet retrieved" }),
        }),
        404: t.Object({ message: t.String({ default: "No wallet found" }) }),
        500: t.Object({
          message: t.String({
            default: "Something went wrong fetching wallets",
          }),
        }),
      },
    },
  )

  // Get a single User's wallet by parameter :self
  .get(
    "/",
    async ({
      status,
      set,
      user: { profileId },
      query: { transactions, profile },
    }: any) => {
      try {
        const wallet: WalletWithOptionalChildren | null =
          await WalletService.getWalletByID(profileId, {
            transactions,
            profile,
          });

        if (!wallet) {
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          return status(404, { message: "No wallet found" });
          // throw new NotFoundError("No wallet found");
        }

        if (!wallet.isActive) {
          // set.status = HttpStatusEnum.HTTP_403_FORBIDDEN;
          return status(403, {
            message: `Your Wallet is disabled. ${wallet.isComment ?? ""}`,
          });
          // throw new AuthorizationError(`Wallet is disabled.. ${wallet.isComment ?? ''}`);
        }

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, { data: wallet, message: "Wallet retrieved" });
      } catch (error: any) {
        console.error("Get my wallet Error.", error);

        // throw error;

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
        return status(500, {
          message: "Error with wallet. " + error.code.toString(),
        });
      }

      // const profile = await usersService.getProfileById(userSession.user.userId);
      // return walletService.get(ctx);
    },
    {
      beforeHandle: [],
      query: QueriesModel.wallet,
      response: {
        200: t.Object({
          data: WalletPlain,
          message: t.String({ default: "Wallet retrieved" }),
        }),
        206: t.Object({ message: t.String({ default: "No wallet found" }) }),
        403: t.Object({
          message: t.String({ default: "Wallet is unavailable" }),
        }),
        404: t.Object({
          message: t.String({ default: "Expected Parameter missing" }),
        }),
        500: t.Object({ message: t.String({ default: "Error with wallet" }) }),
      },
    },
  )

  // Get wallet balance. [SELF]
  .get(
    "/balance",
    async ({
      status,
      set,
      user: { profileId },
      params: { paramProfileId },
      body,
      store,
    }: any) => {
      const id = paramProfileId ?? profileId;

      try {
        const { balance, currency }: { balance: number; currency: Currency } =
          await WalletService.checkBalance(id);

        const state = { wallet: { balance, currency, timestamp: Date.now() } };

        return status(200, {
          data: { currency, balance },
          message: `Balance: ${currency}${balance}`,
        });
      } catch (error: any) {
        console.error(error);

        if (error instanceof NotFoundError) {
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND
          return status(404, { message: "Could not find wallet" });
        }

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
        return status(500, { message: "Unable to retrieve balance" });
      }
    },
    {
      params: t.Object({ paramProfileId: t.String() }),
      response: {
        200: t.Object({
          data: t.Object({ currency: t.Enum(Currency), balance: t.Number() }),
          message: t.String({ default: "Balance: (currency)(balance)" }),
        }),
        404: t.Object({
          message: t.String({ default: "Could not find wallet" }),
        }),
        500: t.Object({
          message: t.String({ default: "Unable to retrieve balance" }),
        }),
      },
    },
  )

  // Get a single User's wallet balance by their ID. [ADMIN]
  .get(
    "/balance/:profileId",
    async ({
      status,
      set,
      user: { profileId },
      params: { paramProfileId },
      body,
      store,
    }: any) => {
      const id = paramProfileId ?? profileId;

      try {
        const { balance, currency }: { balance: number; currency: Currency } =
          await WalletService.checkBalance(id);

        const state = { wallet: { balance, currency, timestamp: Date.now() } };

        return status(200, {
          data: { currency, balance },
          message: `Balance: ${currency}${balance}`,
        });
      } catch (error: any) {
        console.error(error);

        if (error instanceof NotFoundError) {
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND
          return status(404, { message: "Could not find wallet" });
        }

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
        return status(500, { message: "Unable to retrieve balance" });
      }
    },
    {
      beforeHandle: [checkIsAdmin || checkIsStaff],
      params: t.Object({ paramProfileId: t.String() }),
      response: {
        200: t.Object({
          data: t.Object({ currency: t.Enum(Currency), balance: t.Number() }),
          message: t.String({ default: "Balance: (currency)(balance)" }),
        }),
        404: t.Object({
          message: t.String({ default: "Could not find wallet" }),
        }),
        500: t.Object({
          message: t.String({ default: "Unable to retrieve balance" }),
        }),
      },
    },
  )

  .get("/", "Wallet OK")

  /* POST */

  // Create a new User Wallet (Must have profile) [SELF]
  .post(
    "/",
    async ({ status, set, user, params: { paramProfileId } }: any) => {
      const id = paramProfileId ?? user?.profileId;

      try {
        const newWallet: Wallet | null = await WalletService.create(id, {
          initialBalance: 0,
          currency: Currency.ZMW,
        });

        if (!newWallet) {
          throw new InternalServerError("Unable to create new wallet");
        }

        // TODO: Add wallet balance and currency to context
        // state = { wallet: { balance: newWallet.balance, currency: newWallet.currency, timestamp: Date.now() } };

        // set.status = HttpStatusEnum.HTTP_201_CREATED;
        return status(201, {
          data: newWallet,
          message: `Wallet created: (${newWallet.currency} ${newWallet.balance})`,
        });
      } catch (error: any) {
        console.error(error);

        if (error instanceof ConflictError) {
          // error instanceof PrismaClientKnownRequestError
          // set.status = HttpStatusEnum.HTTP_409_CONFLICT
          return status(409, { message: "Unable to create new wallet." });
        }

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
        // return { message: 'Unable to create new wallet' }

        throw error;
      }
    },
    {
      // body: t.Object(CreateWalletDTO),
      params: t.Object({ paramProfileId: t.String() }),
      response: {
        201: t.Object({
          data: WalletPlain,
          message: t.String({ default: "User Wallet successfully created" }),
        }),
        409: t.Object({
          message: t.String({ default: "Wallet already exists" }),
        }),
        500: t.Object({
          message: t.String({ default: "Unable to create new wallet" }),
        }),
      },
    },
  )

  // Create a new User Wallet (Must have profile) [ADMIN | STAFF]
  .post(
    "/:profileId",
    async ({ status, set, user, params: { paramProfileId } }: any) => {
      const id = paramProfileId ?? user?.profileId;

      try {
        const newWallet: Wallet | null = await WalletService.create(id, {
          initialBalance: 0,
          currency: Currency.ZMW,
        });

        if (!newWallet) {
          throw new InternalServerError("Unable to create new wallet");
        }

        // TODO: Add wallet balance and currency to context
        // state = { wallet: { balance: newWallet.balance, currency: newWallet.currency, timestamp: Date.now() } };

        // set.status = HttpStatusEnum.HTTP_201_CREATED;
        return status(201, {
          data: newWallet,
          message: `Wallet created: (${newWallet.currency} ${newWallet.balance})`,
        });
      } catch (error: any) {
        console.error(error);

        if (error instanceof ConflictError) {
          // error instanceof PrismaClientKnownRequestError
          // set.status = HttpStatusEnum.HTTP_409_CONFLICT
          return status(409, { message: "Unable to create new wallet." });
        }

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
        // return { message: 'Unable to create new wallet' }

        throw error;
      }
    },
    {
      beforeHandle: [checkIsStaff || checkIsAdmin],
      params: t.Object({ paramProfileId: t.String() }),
      body: t.Object(WalletPlainInputCreate),
      response: {
        201: t.Object({
          data: WalletPlain,
          message: t.String({ default: "User Wallet successfully created" }),
        }),
        409: t.Object({
          message: t.String({ default: "Wallet already exists" }),
        }),
        // 403: t.Object({ message: t.String({ default: 'Insufficient permission' }) }),
        500: t.Object({
          message: t.String({ default: "Unable to create new wallet" }),
        }),
      },
    },
  )

  // Pay a User [SELF]
  .post(
    "/pay/:profileId",
    async ({
      status,
      set,
      user,
      params: { profileId },
      body: { amount, discountCode, reference, currency, latitude, longitude },
      payment,
    }: any) => {
      console.debug(payment);

      try {
        const transaction = await WalletService.makePayment(
          user.profileId,
          amount,
          discountCode,
          profileId,
          reference,
          latitude,
          longitude,
        );

        // set.status = HttpStatusEnum.HTTP_201_CREATED;
        return status(201, {
          data: transaction,
          message: `Payment of ${transaction.currency}${transaction.amount} successful`,
        });
      } catch (error: any) {
        console.error(error);

        // if(error?.balance < amount){
        //     set.status = HttpStatusEnum.HTTP_409_CONFLICT;
        //     return { message: 'Insufficient balance in wallet' };
        // }

        //set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
        return status(500, { message: "Unable to make payment. " + error });
      }
    },
    {
      params: t.Object({ profileId: t.String() }),
      body: MakePaymentDTO,
      response: {
        200: t.Object({
          data: ViewWalletLiteDTO,
          message: t.String({ default: `Payment to User was successful` }),
        }),
        409: t.Object({
          message: t.String({ default: "Insufficient balance in wallet" }),
        }),
        500: t.Object({
          message: t.String({ default: "Unable to make payment" }),
        }),
      },
    },
  )

  /* PATCH */

  // Disable wallet [SYSTEM]
  .patch(
    "/:profileId",
    async ({ status, set, params: { paramProfileId, isActive } }) => {
      const id = paramProfileId; // ?? profileId;

      try {
        const wallet: Wallet | null = await db.wallet.update({
          where: {
            userProfileId: id,
          },
          data: {
            isActive,
          },
        });

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(HttpStatusEnum.HTTP_204_NO_CONTENT, {
          data: null,
          message: `Successfully ${isActive ? "enabled" : "disabled"} wallet`,
        });
      } catch (error) {
        set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
        return {
          message: `Error ${isActive ? "enabling" : "disabling"} wallet`,
        };
      }
    },
    {
      beforeHandle: [checkIsAdmin || checkIsStaff],
      params: t.Object({
        paramProfileId: t.String(),
        isActive: t.BooleanString({ default: false }),
      }),
      response: {
        204: t.Object({
          data: t.Null(),
          message: t.String({
            default: "Successfully enabled/disabled wallet",
          }),
        }),
        500: t.Object({
          message: t.String({ default: "Error enabling/disabling wallet" }),
        }),
      },
    },
  )

  /* DELETE */

  // Get a single User's wallet by parameter :self
  .delete(
    "/",
    async ({ status, set, user: { profileId } }: any) => {
      try {
        await db.wallet.delete({
          where: {
            userProfileId: profileId,
          },
        });

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: null,
          message: "Successfully deleted wallet",
        });
      } catch (error) {
        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
        return status(500, { message: "Error deleting wallet" });
      }
    },
    {
      beforeHandle: [],
      // query: WalletQueriesDTO,
      // params: t.Object({ self: t.Boolean() }),
      response: {
        200: t.Object({
          data: t.Null(),
          message: t.String({ default: "Successfully deleted wallet" }),
        }),
        206: t.Object({ message: t.String({ default: "No wallet found" }) }),
        403: t.Object({ message: t.String({ default: "Wallet is disabled" }) }),
        404: t.Object({
          message: t.String({ default: "Expected Parameter missing" }),
        }),
        500: t.Object({
          message: t.String({ default: "Error deleting wallet" }),
        }),
      },
    },
  );
