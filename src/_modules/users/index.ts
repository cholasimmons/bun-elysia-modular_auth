import Elysia, { t } from "elysia";
import { UsersService } from "./users.service";
import {
  checkAuth,
  checkEmailVerified,
  checkForProfile,
  checkIsAdmin,
  checkIsStaff,
} from "~middleware/authChecks";
import {
  QueriesModel,
  ProfileWithSafeUserModel,
  ProfileWithPartialUser,
} from "./users.model";
import { swaggerDetails } from "~utils/response_helper";
import { Pagination } from "~modules/root/root.models";
import { FilesService } from "../files/files.service";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { db, prismaSearch } from "~config/prisma";
import { AuthorizationError } from "~exceptions/custom_errors";
import { BucketType, IImageUpload } from "~modules/files/files.model";
import { formatDate, usernameFromEmail } from "~utils/utilities";
import { redisMessagingService } from "~config/redis";
import { S3Error } from "minio";
import {
  AutoEnrolPlain,
  AutoEnrolPlainInputCreate,
} from "@generated/prismabox/AutoEnrol";
import { AutoEnrol, FileStatus, Profile, User } from "@generated/prisma/client";
import {
  ProfileInputUpdate,
  ProfilePlain,
  ProfilePlainInputCreate,
  ProfilePlainInputUpdate,
} from "@generated/prismabox/Profile";
import { UserPlain } from "@generated/prismabox/User";
import { RedisEvents } from "~config/constants";

export const UsersHandler = new Elysia({
  prefix: "/users",
  detail: { description: "User management endpoint", tags: ["Users"] },
})
  // Lifecycle, auth
  .onBeforeHandle(checkAuth)

  // Get all Users [STAFF]
  .get(
    "/",
    async ({ status, set, query }) => {
      const { isActive, profile } = query;
      const { page, limit, sortBy, sortOrder, searchField, search } = query;
      const searchOptions = {
        page,
        limit,
        sortBy: { field: sortBy ?? "createdAt", order: sortOrder },
        search: { field: searchField ?? "lastname", value: search },
        include: { profile, isActive },
      };

      try {
        const users = await prismaSearch("user", searchOptions);
        // const users = await this.userService.getAll(isActive, profiles);

        if (!users) {
          // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
          return status(500, { message: "Could not fetch Users" });
        }

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          total: users.total,
          count: users.count,
          page: users.page,
          data: users.data,
          message: `Found ${users.data.length > 1 ? users.data.length : "0"} Users`,
        });
      } catch (err: any) {
        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
        // return { message: 'Could not fetch Users' }
        throw err;
      }
    },
    {
      beforeHandle: [checkIsAdmin || checkIsStaff, checkForProfile],
      query: t.Object({
        ...Pagination.options,
        ...QueriesModel.user,
      }),
      response: {
        200: t.Object({
          total: t.Numeric(),
          count: t.Numeric(),
          page: t.Numeric(),
          data: t.Array(UserPlain),
          message: t.Optional(
            t.String({ default: "Successfully retrieved Users" }),
          ),
        }),
        404: t.Object({ message: t.String({ default: "No Users found" }) }),
        500: t.Object({
          message: t.String({ default: "Could not fetch Users" }),
        }),
      },
      detail: swaggerDetails(
        "Get All Users",
        "Fetches all available User Accounts (toggle between active or not via isActive query)",
      ),
    },
  )

  // Get Current logged in User [SELF]
  .get(
    "/user",
    async ({ status, set, user, params, query }: any) => {
      const user_id = params?.userId ?? user.id ?? null;
      const { profile } = query;

      try {
        if (!user_id) {
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          return status(404, { message: "No User details found" });
        }

        const u: Partial<User> = await UsersService.getUser(user_id, {
          profile,
        });

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, { data: u, message: "Successfully retrieved User" });
      } catch (err) {
        console.error(err);

        set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
        return { message: "Could not fetch a User", note: err };
      }
    },
    {
      query: QueriesModel.user,
      response: {
        200: t.Object({
          data: UserPlain,
          message: t.String({ default: "Successfully retrieved User" }),
        }),
        404: t.Object({
          message: t.String({ default: "User with that ID not found" }),
        }),
        500: t.Object({
          message: t.String({ default: "Could not search for a User" }),
        }),
      },
      detail: swaggerDetails("Get User Account", "Fetch current User Account"),
    },
  )

  // Get single User by ID [STAFF]
  .get(
    "/user/:userId",
    async ({ status, set, user, params, query }: any) => {
      const user_id = params?.userId ?? user.id ?? null;
      const { profile } = query;

      try {
        if (!user_id) {
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          return status(404, { message: "No User details found" });
        }

        const u: Partial<User> = await UsersService.getUser(user_id, {
          profile,
        });

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, { data: u, message: "Successfully retrieved User" });
      } catch (err) {
        console.error(err);

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
        return status(500, { message: "Could not fetch a User", note: err });
      }
    },
    {
      beforeHandle: [checkIsStaff || checkIsAdmin],
      params: t.Object({
        userId: t.String(),
      }),
      query: QueriesModel.user,
      response: {
        200: t.Object({
          data: UserPlain,
          message: t.String({ default: "Successfully retrieved User" }),
        }),
        404: t.Object({
          message: t.String({ default: "User with that ID not found" }),
        }),
        500: t.Object({
          message: t.String({ default: "Could not fetch a User" }),
        }),
      },
      detail: swaggerDetails(
        "Get User Account by ID [Staff]",
        "Fetch User Account by userId param (Staff only)",
      ),
    },
  )

  .get(
    "/profile",
    async ({ status, set, user, params, query }: any) => {
      const user_id = user?.id;
      const { account, subscription, usedCoupons } = query;

      try {
        const profile: ProfileWithPartialUser =
          await UsersService.getProfileByUserId(user_id, {
            account,
            subscription,
            usedCoupons,
          });

        // if(!profile){
        //     throw new NotFoundError("Profile does not exist");
        //     // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
        //     // return { message: 'Profile does not exist'};
        // }

        if (!profile.isActive) {
          throw new AuthorizationError(
            `Your profile is deactivated. ${profile.isComment ?? ""}`,
          );
          // set.status = HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE;
          // return { data: profile.isComment, message: 'Profile is deactivated' };
        }

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: profile,
          message: "Successfully retrieved your User Profile",
        });
      } catch (e) {
        // console.warn(e);

        throw e;
      }
    },
    {
      query: QueriesModel.profile,
      response: {
        200: t.Object({
          data: ProfilePlain,
          message: t.String({
            default: "Successfully retrieved your User Profile",
          }),
        }),
        404: t.Object({
          message: t.String({ default: "Could not fetch Profile" }),
        }),
        406: t.Object({
          message: t.String({ default: "Profile is deactivated" }),
        }),
        500: t.Object({
          message: t.String({
            default: "Could not load User Profile of that ID",
          }),
          note: t.String(),
        }),
      },
      detail: swaggerDetails("Get User Profile", "Fetch current User Profile"),
    },
  )

  .get(
    "/profile/:userId",
    async ({ status, set, user, params, query }: any) => {
      const user_id = params?.userId;
      const { account, subscription, usedCoupons } = query;

      try {
        const profile = await UsersService.getProfileByUserId(user_id, {
          account,
          subscription,
          usedCoupons,
        });

        // if(!profile){
        //     throw new NotFoundError("Error fetching Profile");
        //     // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
        //     // return { message: '' };
        // }

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: profile,
          message: `Successfully retrieved User Profile${account ? " and Account" : "."}`,
        });
      } catch (e: any) {
        console.warn(e);

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
        return status(500, {
          message: "Could not fetch Profile of that ID",
          note: String(e.message),
        });
      }
    },
    {
      beforeHandle: [checkIsStaff || checkIsAdmin],
      params: t.Object({ userId: t.String() }),
      query: QueriesModel.profile,
      response: {
        200: t.Object({
          data: ProfilePlain,
          message: t.String({ default: "Successfully retrieved User Profile" }),
        }),
        404: t.Object({
          message: t.String({ default: "Profile not available" }),
        }),
        500: t.Object({
          message: t.String({
            default: "Could not load User Profile of that ID",
          }),
        }),
      },
      detail: swaggerDetails(
        "Get User Profile by ID [Staff]",
        "Fetch User Profile by userId param (Staff only)",
      ),
    },
  )

  .get(
    "/profiles",
    async ({
      status,
      set,
      query: { account },
    }: any): Promise<
      { data: Profile[]; message: string } | { message: string }
    > => {
      try {
        const profiles = await db.profile.findMany({
          include: {
            user: account
              ? {
                  select: {
                    id: true,
                    firstname: true,
                    lastname: true,
                    roles: true,
                    email: true,
                    emailVerified: true,
                    phone: true,
                    isActive: true,
                    isComment: true,
                    createdAt: true,
                  },
                }
              : false,
          },
        });

        if (!profiles) {
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          return status(400, { message: "Error retrieving User Profiles" });
        }

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: profiles,
          message: `Retrieved ${profiles.length > 1 ? profiles.length : "0"} User Profiles`,
        });
      } catch (e: any) {
        console.warn(e);

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
        return status(500, { message: "Could not retrieve User Profiles" });
      }
    },
    {
      beforeHandle: [checkIsStaff || checkIsAdmin],
      query: t.Object({ ...Pagination.options, ...QueriesModel.profile }),
      response: {
        200: t.Object({
          data: t.Array(ProfilePlain),
          message: t.String({
            default: "Successfully retrieved n User Profiles",
          }),
        }),
        404: t.Object({
          message: t.String({ default: "No User Profiles found" }),
        }),
        500: t.Object({
          message: t.String({ default: "Unable to fetch User Profiles" }),
        }),
      },
      detail: swaggerDetails(
        "Get all User Profiles [Staff]",
        "Fetch User Profiles (Staff only)",
      ),
    },
  )

  // Add a new Post User Account [ADMIN]
  .get(
    "/autousers",
    async ({ status, set }) => {
      try {
        const autos = await db.autoEnrol.findMany();

        if (!autos) {
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          return status(404, { message: "Could not retrieve auto-enrollers" });
        }

        // set.status = 200;
        return status(200, {
          data: autos,
          message: `Retrieved ${autos.length ?? 0} Auto-enrollers`,
        });
      } catch (error) {
        console.error(error);

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
        return status(500, {
          message: "An internal error occurred with auto-enrollment",
        });
      }
    },
    {
      beforeHandle: [checkIsAdmin || checkIsStaff],
      response: {
        200: t.Object({
          data: t.Array(AutoEnrolPlain),
          message: t.String({ default: "Retrieved all Auto-Users" }),
        }),
        404: t.Object({
          message: t.String({ default: "Could not retrieve auto-enrollers" }),
        }),
        500: t.Object({
          message: t.String({ default: "Could not fetch Auto-Users." }),
        }),
      },
      detail: swaggerDetails(
        "Get Auto Users [Staff]",
        "Fetch all Auto Users (Staff only)",
      ),
    },
  )

  // Get Current logged in User's active status [SELF]
  .get(
    "/status/user",
    async ({ status, set, user, params }: any) => {
      const user_id = params?.userId ?? user?.id;

      try {
        if (!user_id) {
          // throw new NotFoundError(
          //   "No User ID found",
          //   404,
          //   "No User ID was provided",
          // );
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          return status(404, { message: "No User ID found" });
        }

        const u: Partial<User> = await UsersService.getUser(user_id);

        const isActive = u.isActive;

        if (isActive == null || isActive == undefined) {
          // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
          return status(500, { message: "Active status unknown" });
        }

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: isActive.toString(),
          message: "Successfully retrieved User Account status",
        });
      } catch (err) {
        console.error(err);

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
        return status(500, { message: "Could not fetch User's Active status" });
      }
    },
    {
      response: {
        200: t.Object({
          data: t.BooleanString(),
          message: t.String({ default: "Retrieved User Account status" }),
        }),
        404: t.Object({
          message: t.String({ default: "User with that ID not found" }),
        }),
        500: t.Object({
          message: t.String({
            default: "Could not fetch User's Active status",
          }),
        }),
      },
      detail: swaggerDetails(
        "Get User Account Status",
        "Fetch current User's Account status",
      ),
    },
  )

  // Get User's active status by userId [STAFF]
  .get(
    "/status/user/:userId",
    async ({ status, set, user, params }: any) => {
      const user_id = params?.userId ?? user?.id;

      try {
        if (!user_id) {
          // throw new NotFoundError(
          //   "No User ID found",
          //   404,
          //   "No User ID was provided",
          // );
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          return status(404, { message: "No User ID found" });
        }

        const u: Partial<User> = await UsersService.getUser(user_id);

        const isActive = u.isActive;

        if (isActive == null || isActive == undefined) {
          // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
          return status(500, { message: "Active status unknown" });
        }

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: isActive.toString(),
          message: "Successfully retrieved User Account status",
        });
      } catch (err) {
        console.error(err);

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
        return status(500, { message: "Could not fetch User's Active status" });
      }
    },
    {
      beforeHandle: [checkIsStaff || checkIsAdmin],
      params: t.Object({ userId: t.String() }),
      response: {
        200: t.Object({
          data: t.BooleanString(),
          message: t.String({ default: "Retrieved User Account status" }),
        }),
        404: t.Object({
          message: t.String({ default: "User with that ID not found" }),
        }),
        500: t.Object({
          message: t.String({
            default: "Could not fetch User's Active status",
          }),
        }),
      },
      detail: swaggerDetails(
        "Get User Account Status by ID [Staff]",
        "Fetch User's Account status by their userId param [Staff]",
      ),
    },
  )

  // Get Current logged in User's Profile status [SELF]
  .get(
    "/status/profile",
    async ({ status, set, user, params }: any) => {
      const user_id = params?.userId ?? user?.id;

      try {
        if (!user_id) {
          // throw new NotFoundError("No User ID provided");
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          return status(404, { message: "No User ID found" });
        }

        const partialProfile: Partial<Profile> =
          await UsersService.getProfileByUserId(user_id);

        const isActive = partialProfile.isActive;

        if (isActive == null || isActive == undefined) {
          // throw new InternalServerError("Active status unknown");
          // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
          return status(500, { message: "Active status unknown" });
        }

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: isActive.toString(),
          message: "Retrieved User Profile status",
        });
      } catch (err) {
        console.error(err);

        // throw err;

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
        return status(500, { message: "Could not fetch User's Active status" });
      }
    },
    {
      beforeHandle: [checkForProfile],
      response: {
        200: t.Object({
          data: t.BooleanString(),
          message: t.String({ default: "Retrieved User Profile status" }),
        }),
        // 404: t.Object({ message: t.String({ default: 'User with that ID not found' }) }),
        500: t.Object({
          message: t.String({ default: "Could not fetch your Profile status" }),
        }),
      },
      detail: swaggerDetails(
        "Get my Profile Status",
        "Fetches your Profile status",
      ),
    },
  )

  // Get User's Profile status by userId [STAFF]
  .get(
    "/status/profile/:userId",
    async ({ status, set, user, params }: any) => {
      const user_id = params?.userId ?? user?.id;

      try {
        if (!user_id) {
          // throw new NotFoundError("No User ID provided");
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          return status(404, { message: "No User ID found" });
        }

        const partialProfile: Partial<Profile> =
          await UsersService.getProfileByUserId(user_id);

        const isActive = partialProfile.isActive;

        if (isActive == null || isActive == undefined) {
          // throw new InternalServerError("Active status unknown");
          // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
          return status(500, { message: "Active status unknown" });
        }

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: isActive.toString(),
          message: "Retrieved User Profile status",
        });
      } catch (err) {
        console.error(err);

        // throw err;

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
        return status(500, { message: "Could not fetch User's Active status" });
      }
    },
    {
      beforeHandle: [checkIsStaff || checkIsAdmin],
      params: t.Object({ userId: t.String() }),
      response: {
        200: t.Object({
          data: t.BooleanString(),
          message: t.String({ default: "Retrieved User Profile status" }),
        }),
        404: t.Object({
          message: t.String({ default: "User with that ID not found" }),
        }),
        500: t.Object({
          message: t.String({ default: "Could not fetch Profile status" }),
        }),
      },
      detail: swaggerDetails(
        "Get User Profile Status by ID [Staff]",
        "Fetches User's Profile status by UserId param [Staff]",
      ),
    },
  )

  .get("/health", "Users OK")

  /* POST */

  // Create new User Profile [SELF]
  .post(
    "/profile",
    async ({
      status,
      set,
      body,
      user: { id, firstname, lastname, email, phone, profileId },
      request: { headers },
      jwt,
      authMethod,
    }: any) => {
      try {
        // Checking if ProfileID exists in session/token
        if (profileId) {
          // Checking if User already has a Profile
          const profile = await db.profile.findUnique({
            where: { id: profileId },
            select: { id: true },
          });

          if (profile) {
            // throw new ConflictError("You already have a profile.");
            // set.status = HttpStatusEnum.HTTP_409_CONFLICT;
            return status(HttpStatusEnum.HTTP_409_CONFLICT, {
              message: `You already have a profile.`,
            });
          }
        }

        // console.log('Checking for pre-existing Profile of similar credentials...');
        // Check DB for profile of same nrc/passport number
        const conflictingProfile: Partial<Profile> | null =
          await db.profile.findFirst({
            where: {
              documentId: body.documentId,
              documentType: body.documentIdType,
            },
            select: {
              documentId: true,
              documentType: true,
              firstname: true,
              lastname: true,
            },
          });

        // Store what values conflict so we can inform User
        let conflict: string = "";
        if (
          conflictingProfile &&
          conflictingProfile?.documentId === body.documentId
        ) {
          conflict = conflictingProfile?.documentId!;

          // set.status = HttpStatusEnum.HTTP_302_FOUND;
          return status(HttpStatusEnum.HTTP_302_FOUND, {
            message: `That ${conflictingProfile.documentType!.toLocaleUpperCase()} number is already used`,
            note: `Similar ${conflictingProfile.documentType!.toLocaleUpperCase()} exists in the system`,
          });
        }

        // let uploadedImage: {etag:string; versionId:string|null}|null = null;
        let uploadedImage: IImageUpload | null = null;
        let uploadError: string | null = null;

        // If User uploaded a photo, persist it to File Server and add it's ID to profile
        if (body.photo) {
          try {
            uploadedImage = await FilesService.uploadPhoto(
              body.photo,
              BucketType.USERS,
              id,
              usernameFromEmail(email),
              false,
            );
          } catch (err: any) {
            uploadError = err.toString();
            console.error(err);
          }
        }

        const autoUser: Partial<AutoEnrol> | null =
          await db.autoEnrol.findFirst({
            where: { email: email },
            select: { supportLevel: true },
          });

        // Append user & image ID to profile
        const ammendedProfile = {
          firstname: body.firstname ?? firstname,
          lastname: body.lastname ?? lastname,
          documentId: body.documentId,
          documentType: body.documentType,
          gender: body.gender,
          bio: body.bio ?? null,
          email: email,
          phone: phone ?? body.phone,
          supportLevel: autoUser?.supportLevel ?? 0,
          userId: id,
          photo: uploadedImage?.name ?? null,
        };

        // Disabled, to keep auto-users list forever
        // if(autoUser?.supportLevel && autoUser?.supportLevel > 0){
        //     await db.autoEnrol.update({ where: { email: email}, data: { isActive: false, isComment: `Used for Profile Registration at ${new Date()}` } });
        // }

        // Create a new User Profile
        const newProfile: ProfileWithSafeUserModel =
          await UsersService.createUserProfile(ammendedProfile);

        if (!newProfile) {
          // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
          return status(500, {
            message: "Problem processing profile submission.",
          });
          // throw new InternalServerError("Error processing profile submission.");
        }

        // TODO: Ideally have the profile created as inactive, until approven by a case officer
        // Payment could be an option or simply a document verification

        redisMessagingService.publish("user-events", {
          action: RedisEvents.USER_PROFILE_CREATED,
          user: newProfile,
        });

        // Generate access token using new profile details
        // const tokenOrCookie = await this.authService.createDynamicSession(authMethod, jwt, newProfile.user!, headers, undefined);
        // if(authMethod === 'JWT'){
        //     set.headers["Authorization"] = `Bearer ${tokenOrCookie}`;
        // } else if (authMethod === 'Cookie'){
        //     set.headers["Set-Cookie"] = tokenOrCookie.serialize();
        // }

        // set.status = HttpStatusEnum.HTTP_201_CREATED;
        return status(201, {
          data: newProfile,
          message: `User Profile successfully created. ${!!uploadedImage ? "" : "(No image)"}`,
        });
      } catch (err: any) {
        console.warn(`errrr ${err}`);

        // if(err instanceof SharpImageError){
        //     console.warn("Sharp ",err);

        //     set.status = err.errorCode;
        //     return { message: err.message }
        // }

        if (err instanceof S3Error) {
          // set.status = HttpStatusEnum.HTTP_503_SERVICE_UNAVAILABLE;
          return status(503, {
            message: err.message,
            note: err.code ?? err.name,
          });
        }

        throw err;

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
        // return { message: 'Problem processing Profile submission', note:err }
      }
    },
    {
      beforeHandle: [checkEmailVerified],
      body: ProfilePlainInputCreate,
      response: {
        201: t.Object({
          data: ProfilePlain,
          message: t.String({
            default: "Successfully created new User Profile",
          }),
        }),
        302: t.Object({
          message: t.String({
            default: "A profile already exists with those credentials",
          }),
        }),
        403: t.Object({
          message: t.String({
            default: "You are not email verified.",
            error: "Email verification required",
          }),
        }),
        406: t.Object({
          message: t.String({ default: "Your submission was not valid." }),
        }),
        409: t.Object({
          message: t.String({ default: "You already have a profile" }),
        }),
        500: t.Object({
          message: t.String({
            default: "Problem processing profile submission.",
          }),
        }),
      },
      detail: swaggerDetails(
        "Create User Profile",
        "Create a User Profile if email is verified",
      ),
    },
  )

  // Add a new Post User Account [ADMIN]
  .post(
    "/autouser",
    async ({ status, set, body }: any) => {
      const { names, email, phone, roles, supportLevel } = body;
      try {
        const user: AutoEnrol = await db.autoEnrol.create({
          data: {
            names,
            email,
            phone,
            roles,
            supportLevel,
          },
        });

        if (!user) {
          // set.status = 404;
          return status(404, { message: "Unable to create data table" });
        }

        // set.status = HttpStatusEnum.HTTP_201_CREATED;
        return status(201, {
          data: user,
          message: `Successfully created an Auto-User`,
        });
      } catch (error: any) {
        console.error(error);

        if (error.code === "P2002") {
          // set.status = HttpStatusEnum.HTTP_409_CONFLICT;
          return status(HttpStatusEnum.HTTP_409_CONFLICT, {
            message: "A similar entry already exists",
          });
        }

        // set.status = 500;
        return status(500, { message: "Could not create Auto-User" });
      }
    },
    {
      beforeHandle: [checkIsAdmin],
      body: AutoEnrolPlainInputCreate,
      response: {
        201: t.Object({
          data: AutoEnrolPlain,
          message: t.String({ default: "Successfullly addedd an Auto-User" }),
        }),
        500: t.Object({
          message: t.String({ default: "Could not create Auto-User." }),
        }),
      },
      detail: swaggerDetails(
        "Create Auto User [Admin]",
        "Appends a new Auto Enrol User (Admin only)",
      ),
    },
  )

  /* PATCH */

  // Update User Profile [SELF]
  .patch(
    "/profile",
    async ({ status, set, params, user, body }: any) => {
      const user_id = params?.userId ?? user?.id ?? null;
      const data: Partial<Profile> = { ...body };

      try {
        let uploadedImage: IImageUpload | any = null;

        if (body?.photo) {
          try {
            // File service
            await db.$transaction(async (tx) => {
              const tempImage = await FilesService.uploadPhoto(
                body.photo!,
                BucketType.USERS,
                user?.profileId,
                user?.id,
                false,
                false,
              );

              if (!uploadedImage) {
                console.error("Unable to upload image");
                return status(500, { message: "Could not upload User image" });
              }

              uploadedImage = tempImage; // Assign only after successful upload

              await tx.fileUpload.create({
                data: {
                  origName: body.photo?.name ?? "",
                  fileName: uploadedImage.name,
                  fileType: uploadedImage.type,
                  fileSize: uploadedImage.size,
                  key: uploadedImage.name,
                  bucket: BucketType.USERS,
                  path: `/${BucketType.USERS.toLowerCase()}/${uploadedImage.name}`,
                  uploaderUserId: user.id,
                  status: FileStatus.UPLOADED,
                  isPublic: Boolean(true),
                },
              });
            });
          } catch (err) {
            console.error(err);
          }
        }

        const profile = await db.profile.update({
          where: { userId: user_id },
          data: {
            bio: data.bio,
            photo: uploadedImage?.name ?? null,
            firstname: data.firstname,
            lastname: data.lastname,
            gender: user_id ? data.gender : undefined,
            documentId: params?.userId ? data.documentId : undefined,
            documentType: params?.userId ? data.documentType : undefined,
            supportLevel: params?.userId ? data.supportLevel : undefined,
            phone: data.phone,
            isActive: params?.userId ? data.isActive : undefined,
            isComment: params?.userId ? data.isComment : undefined,
          },
        });

        if (!profile) {
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          return status(404, { message: "Could not update Profile" });
        }

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: profile,
          message: `Successfully updated User Profile${uploadedImage?.name ? "." : " (Without photo)"}`,
        });
      } catch (error) {
        console.error(error);

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
        return status(500, { message: "Could not modify User Profile" });
      }
    },
    {
      params: t.Object({ userId: t.Optional(t.String()) }),
      query: QueriesModel.profile,
      body: t.Intersect([
        ProfileInputUpdate,
        t.Object({ photo: t.Optional(t.File({ type: "image" })) }),
      ]),
      response: {
        200: t.Object({
          data: ProfilePlain,
          message: t.String({ default: "Successfully updated User Profile." }),
        }),
        404: t.Object({
          message: t.String({ default: "Could not update Profile" }),
        }),
        500: t.Object({
          message: t.String({ default: "Could not modify User Profile." }),
        }),
      },
      detail: swaggerDetails(
        "Update User Profile",
        "Updates the current User' Profile",
      ),
    },
  )

  // Update other User Profile [STAFF]
  .patch(
    "/profile/:userId",
    async ({ status, set, params, user, body }: any) => {
      const user_id = params?.userId ?? user?.id ?? null;
      const data: Profile = { ...body };

      try {
        let uploadedImage: IImageUpload | any = null;

        if (body?.photo) {
          try {
            // File service
            await db.$transaction(async (tx: any) => {
              const tempImage = await FilesService.uploadPhoto(
                body.photo,
                BucketType.USERS,
                user?.profileId,
                user?.id,
                false,
                false,
              );

              if (!uploadedImage) {
                console.error("Unable to upload image");
                return { note: "Could not upload User image" };
              }

              uploadedImage = tempImage; // Assign only after successful upload

              await tx.fileUpload.create({
                data: {
                  origName: body.photo.name,
                  fileName: uploadedImage.name,
                  fileType: uploadedImage.type,
                  fileSize: uploadedImage.size,
                  key: uploadedImage.name,
                  bucket: BucketType.USERS,
                  path: `/${BucketType.USERS.toLowerCase()}/${uploadedImage.name}`,
                  uploaderUserId: user.id,
                  status: FileStatus.UPLOADED,
                  isPublic: Boolean(true),
                },
              });
            });
          } catch (err) {
            console.error(err);
          }
        }

        const profile = await db.profile.update({
          where: { userId: user_id },
          data: {
            bio: data.bio,
            photo: uploadedImage?.name ?? null,
            firstname: data.firstname,
            lastname: data.lastname,
            gender: user_id ? data.gender : undefined,
            documentId: params?.userId ? data.documentId : undefined,
            documentType: params?.userId ? data.documentType : undefined,
            supportLevel: params?.userId ? data.supportLevel : undefined,
            phone: data.phone,
            isActive: params?.userId ? data.isActive : undefined,
            isComment: params?.userId ? data.isComment : undefined,
          },
        });

        if (!profile) {
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          return status(404, { message: "Could not update Profile" });
        }

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: profile,
          message: `Successfully updated User Profile${uploadedImage?.name ? "." : " (Without photo)"}`,
        });
      } catch (error) {
        console.error(error);

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
        return status(500, {
          message: "Could not modify User Profile",
          note: error,
        });
      }
    },
    {
      beforeHandle: [checkIsStaff],
      params: t.Object({ userId: t.String() }),
      query: QueriesModel.profile,
      body: ProfilePlainInputUpdate,
      response: {
        200: t.Object({
          data: ProfilePlain,
          message: t.String({ default: "Successfully updated User Profile." }),
        }),
        404: t.Object({
          message: t.String({ default: "Could not update Profile" }),
        }),
        500: t.Object({
          message: t.String({ default: "Could not modify User Profile." }),
        }),
      },
      detail: swaggerDetails(
        "Update User Profile by ID [Staff]",
        "Updates User Profile by their userId param (Staff only)",
      ),
    },
  )

  // Activate/Deactivate User Profile [SELF]
  .patch(
    "/user/deactivate",
    async ({
      status,
      user,
      set,
      params,
      body: { isComment },
    }: any): Promise<
      { data: Partial<User>; message: string } | { message: string }
    > => {
      const user_id = params?.userId ?? user.id ?? null;
      const now = new Date();
      const theComment = isComment ?? `Deactivated on ${formatDate(now)}`;

      try {
        const user = await db.user.update({
          where: { id: user_id },
          data: { isActive: false, isComment: theComment },
          select: {
            id: true,
            firstname: true,
            lastname: true,
            username: true,
            roles: true,
            email: true,
            emailVerified: true,
            phone: true,
            profile: false,
            profileId: true,
            isActive: true,
            isComment: true,
            createdAt: true,
          },
        });

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: user,
          message: `User successfully deactivated`,
        });
      } catch (error) {
        console.error(error);

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
        return status(500, { message: `Could not deactivate user account.` });
      }
    },
    {
      body: t.Optional(t.Object({ isComment: t.String() })),
      response: {
        200: t.Object({
          data: t.Optional(UserPlain),
          message: t.String(),
        }),
        // 404: t.Object({ message: t.String({ default: 'Profile not found' })}),
        500: t.Object({
          message: t.String({ default: "Could not deactivate user account." }),
        }),
      },
      detail: swaggerDetails(
        "Deactivate User Account [Self]",
        "Deactivates current User's Account",
      ),
    },
  )

  // Activate/Deactivate User Profile [STAFF | ADMIN]
  .patch(
    "/user/deactivate/:userId",
    async ({
      status,
      user,
      set,
      params,
      body: { isComment },
    }: any): Promise<
      { data: Partial<User>; message: string } | { message: string }
    > => {
      const user_id = params?.userId ?? user.id ?? null;
      const now = new Date();
      const theComment = isComment ?? `Deactivated on ${formatDate(now)}`;

      try {
        const user = await db.user.update({
          where: { id: user_id },
          data: { isActive: false, isComment: theComment },
          select: {
            id: true,
            firstname: true,
            lastname: true,
            username: true,
            roles: true,
            email: true,
            emailVerified: true,
            phone: true,
            profile: false,
            profileId: true,
            isActive: true,
            isComment: true,
            createdAt: true,
          },
        });

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: user,
          message: `User successfully deactivated`,
        });
      } catch (error) {
        console.error(error);

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
        return status(500, { message: `Could not deactivate user account.` });
      }
    },
    {
      beforeHandle: [checkIsStaff || checkIsAdmin],
      params: t.Object({ userId: t.String() }),
      body: t.Object({ isComment: t.String() }),
      response: {
        200: t.Object({
          data: t.Optional(UserPlain),
          message: t.String(),
        }),
        // 404: t.Object({ message: t.String({ default: 'Profile not found' })}),
        500: t.Object({
          message: t.String({ default: "Could not deactivate user account." }),
        }),
      },
      detail: swaggerDetails(
        "Deactivate User Account [Admin, Staff]",
        "Deactivates User Account by their userId param (Admin, Staff)",
      ),
    },
  );
