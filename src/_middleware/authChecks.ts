import { Role } from "@prisma/client";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { db } from "~config/prisma";


// Dynamically check between admin-console and client-app
export const checkAuth = async ({ set, session, user, request:{headers}, cookie:{ lucia_auth }, authJWT }: any)  => {
  
  // Check if the Authentication-Method header is present
  const authMethod = headers.get('Authentication-Method') ?? null;

  if (!authMethod) {
    console.debug('Authentication method not specified.', authMethod);
    
    // If the header is missing, return an error response
    set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
    return { success: false, message: "Authentication method not specified", data: null };
  }

  // Determine which authentication method to use based on the header value
  if (authMethod === 'Cookie') {
    // Handle cookie-based authentication
    // Check for session cookie and validate the admin's session

    if(!session){
      console.warn("No session data present. Are you logged in?");
      
      set.status = HttpStatusEnum.HTTP_401_UNAUTHORIZED;
      return { message: 'Unauthorized Access' };
    }

  } else if (authMethod === 'JWT') {
      // Handle JWT-based authentication
      // Extract and validate JWT token from request headers or body

    const token = headers?.get('Authorization')?.replace("Bearer ", "") ?? null;
    if(!token){
      set.status = HttpStatusEnum.HTTP_401_UNAUTHORIZED;
      console.debug("No JWT token");
      return {
        success: false,
        message: "Unauthorized. Access token not present",
        data: null,
      };
    }

    if (!user.id) {
      set.status = HttpStatusEnum.HTTP_401_UNAUTHORIZED;
      return {
        success: false,
        message: "Unauthorized. Access token not verified",
        data: null,
      };
    }
  } else {
      // If an unsupported authentication method is specified, return an error response
      set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
      return { success: false, message: `Unsupported authentication method. ${authMethod}`, data: null };
  }
}

// Check if user's email is verified
export const checkEmailVerified = async ({ set, user }:any) => {
  if(!user){
    set.status = HttpStatusEnum.HTTP_403_FORBIDDEN;
    return { message: 'User session unavailable.' }
  }

  if(!user.emailVerified){
    set.status = HttpStatusEnum.HTTP_403_FORBIDDEN;
    return { message: 'Your account is not verified.' }
  }
}



// Check user roles for Admin
export const checkIsAdmin = async ({ set, user }:any) => {
  if(!user?.roles.some((role:any) => [Role.ADMIN].includes(role))) {
    set.status = HttpStatusEnum.HTTP_403_FORBIDDEN;
    return { message: 'Access denied. Insufficient privileges' };
  }
}

// Check user roles for "Staff" roles"
export const checkIsStaff = async ({ set, user }:any) => {
  if(!user?.roles.some((role:any) => [Role.SUPERVISOR, Role.ADMIN, Role.SUPPORT].includes(role))) {
    set.status = HttpStatusEnum.HTTP_403_FORBIDDEN;
    return { message: 'Access denied. Insufficient privileges' };
  }
}

// checks if current User has an active profile
export const checkForProfile =  async ({ set, user }: any) => {
  // console.log(user);
  // console.log(session);
  
  if (!user || !user.isActive) {
    set.status = HttpStatusEnum.HTTP_403_FORBIDDEN;
    return { message: 'Active User Account & Profile required' };
  }

  if(!user.profileId){
    set.status = HttpStatusEnum.HTTP_403_FORBIDDEN;
    const reason = !user.profileId ? 'User Profile required' : !user.profileIsActive ? 'Active User Profile required' : null
    return { message: `Access Denied. ${reason}` };
  }
}




// this checks Cookie  (Admin Console), if not supplied the request will be rejected!
export const checkCookieAuth = async ({ set, session, request:{headers}, cookie:{ lucia_auth } }: any)  => {
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
export const checkJWTAuth = (app: Elysia) => 
  app.derive(async ({ authJWT, set, request:{ headers } }:any) => {

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


    const { userId } = await authJWT.verify(token);
    if (!userId) {
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
        id: userId,
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
