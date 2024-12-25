import { Role } from "@prisma/client";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { lucia } from "~config/lucia";
import { db } from "~config/prisma";


// Dynamically check between admin-console and client-app
export const checkAuth = async ({ session, user, request:{headers}, cookie:{ lucia_auth }, authMethod, jwt, error }: any)  => {
 
  // Check if the Authentication-Method header is present
  // const authMethod = headers.get('Authentication-Method') ?? null;

  if (!authMethod) {
    console.debug('Authentication method not specified.', authMethod);
    
    // If the header is missing, return an error response
    // set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
    return error(400, "Authentication method not specified");
  }

  // Determine which authentication method to use based on the header value
  if (authMethod === 'Cookie') {
    // Handle cookie-based authentication
    // Check for session cookie and validate the admin's session

    if(!session && !user){
      console.warn("No session data present. Are you logged in?");
      
      // set.status = HttpStatusEnum.HTTP_401_UNAUTHORIZED;
      return error(401, 'Unauthorized Access. Are you signed in?');
    }

  } else if (authMethod === 'JWT') {
      // Handle JWT-based authentication
      // Extract and validate JWT token from request headers or body

    const token = headers?.get('Authorization')?.replace("Bearer ", "") ?? null;
    if(!token){
      // set.status = HttpStatusEnum.HTTP_401_UNAUTHORIZED;

      return error(401, "Unauthorized. Access token not present");
    }

    const tokenUser = await jwt.verify(token);
    
    if (!tokenUser?.id) {
      // set.status = HttpStatusEnum.HTTP_401_UNAUTHORIZED;
      return error(401, "Unauthorized. Access token not verified");
    }
  } else {
      // If an unsupported authentication method is specified, return an error response
      // set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
      return error(400, `${authMethod} unsupported authentication method`);
  }
}

// Check if user's email is verified
export const checkEmailVerified = async ({ user, error }:any) => {
  if(!user){
    // set.status = HttpStatusEnum.HTTP_403_FORBIDDEN;
    return error(403, 'User entity unavailable.');
  }

  if(!user.emailVerified){
    // set.status = HttpStatusEnum.HTTP_403_FORBIDDEN;
    return error(403, 'Your account is not email verified.');
  }
}


// Check user roles for Admin
export const checkIsAdmin = async ({ user, error }:any) => {
  const roles = user?.roles;

  if(!roles.some((role:any) => [Role.ADMIN].includes(role))) {
    // set.status = HttpStatusEnum.HTTP_403_FORBIDDEN;
    return error(403, 'Access denied. Insufficient privileges');
  }
}

// Check user roles for "Staff" roles"
export const checkIsStaff = async ({ user, error }:any) => {
  const roles = user?.roles;

  if(!roles.some((role:any) => [Role.SUPERVISOR, Role.SUPPORT].includes(role))) {
    // set.status = HttpStatusEnum.HTTP_403_FORBIDDEN;
    return error(403, 'Access denied. Insufficient privileges');
  }
}

// checks if current User has an active profile
export const checkForProfile =  async ({ user, error }: any) => {
  const { isActive, profileId, profileIsActive } = user ?? {};
  
  // if (!user || !isActive) {
  //   set.status = HttpStatusEnum.HTTP_403_FORBIDDEN;
  //   return { message: 'Active User Account & Profile required', note: 'User Account is deactivated' };
  // }

  if(!profileId){
    const reason = !profileId
      ? 'User Profile required'
      : !profileIsActive
        ? 'Active User Profile required'
        : null
    // set.status = 403;
    return error(403, `Access Denied. ${reason}`);
  }
}




// this checks Cookie  (Admin Console), if not supplied the request will be rejected!
const checkCookieAuth = async ({ set, session, request:{headers}, cookie:{ lucia_auth } }: any)  => {
  try {
    if(!session){
      console.warn("No session data present. Are you logged in?");
      
      set.status = HttpStatusEnum.HTTP_401_UNAUTHORIZED;
      return { message: 'Unauthorized Access' };
    }
    
  } catch (error) {
    console.warn(error);
  }
}

// this checks JWT token (Frontend client), if not supplied the request will be rejected!
const checkJWTAuth = (app: Elysia) => 
  app.derive(async ({ jwt, set, request:{ headers } }:any) => {

    const token = headers?.get('Authorization')?.replace("Bearer ", "") ?? null;
    if(!token){
      set.status = 401;
      console.debug("No JWT token");
      return {
        success: false,
        message: "Unauthorized. Access token not present",
        data: null,
      };
    }


    const { id } = await jwt.verify(token);
    if (!id) {
      set.status = 401;
      console.debug("No user.userId in JWT");
      return {
        success: false,
        message: "Unauthorized",
        data: null,
      };
    }

    const user = await db.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!user) {
      set.status = 401;
      return {
        success: false,
        message: "Unauthorized. Please create an account",
        data: null,
      };
    }

    return { user };
});
