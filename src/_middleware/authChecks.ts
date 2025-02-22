import { Role } from "@prisma/client";
import { AuthenticationError, AuthorizationError, NotFoundError } from "~exceptions/custom_errors";
import { constants } from "~config/constants";
import { lucia } from "~config/lucia";
import { db } from "~config/prisma";


// Checks for correct Headers
export const headerCheck = ({ request:{ headers }, authMethod }:any) => {
  if (!authMethod) {
    const method: string|null = headers.get(constants.auth.method ?? "X-Client-Type");

    if(!method){
      throw new AuthenticationError("Authentication mode not specified");
    }

    throw new AuthenticationError("Authentication method not specified");
  }
}


// Dynamically check between admin-console and client-app
export const checkAuth = async ({ session, user, request:{headers}, cookie:{ lucia_auth }, authMethod, jwt, error }: any)  => {
 
  // Check if the Authentication-Method header is present
  // const authMethod = headers.get('Authentication-Method') ?? null;

  if (!authMethod) {
    console.debug('Authentication method not specified.', authMethod);
    
    throw new AuthenticationError("Authentication method not specified");
  }

  // Determine which authentication method to use based on the header value
  if (authMethod === 'Cookie') {
    // Handle cookie-based authentication
    // Check for session cookie and validate the admin's session

    if(!session && !user){
      console.warn("No session data present. Are you logged in?");
      
      // set.status = HttpStatusEnum.HTTP_401_UNAUTHORIZED;
      throw new AuthenticationError("Unauthorized Access. Are you signed in?");
    }

  } else if (authMethod === 'JWT') {
      // Handle JWT-based authentication
      // Extract and validate JWT token from request headers or body

    const token = headers?.get('Authorization')?.replace("Bearer ", "") ?? null;
    if(!token){
      // set.status = HttpStatusEnum.HTTP_401_UNAUTHORIZED;

      throw new AuthenticationError("Unauthorized. Access token not present");
      
    }

    const tokenUser = await jwt.verify(token);
    
    if (!tokenUser?.id) {
      // set.status = HttpStatusEnum.HTTP_401_UNAUTHORIZED;
      throw new AuthenticationError("Unauthorized. Access token not verified");
    }
  } else {
      // If an unsupported authentication method is specified, return an error response
      // set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
      throw new AuthenticationError(`${authMethod} unsupported authentication method`);
  }
}

// Check if user's email is verified
export const checkEmailVerified = async ({ user, error }:any) => {
  if(!user){
    // set.status = HttpStatusEnum.HTTP_403_FORBIDDEN;
    throw new AuthorizationError("User entity unavailable.");
  }

  if(!user.emailVerified){
    // set.status = HttpStatusEnum.HTTP_403_FORBIDDEN;
    throw new AuthorizationError("You are not email verified.");
  }
}


// Check user roles for Admin
export const checkIsAdmin = async ({ user, error }:any) => {
  const roles = user?.roles;

  if(!roles.some((role:any) => [Role.ADMIN].includes(role))) {
    throw new AuthorizationError('Access denied. Insufficient privileges')
  }
}

// Check user roles for "Staff" roles"
export const checkIsStaff = async ({ user, error }:any) => {
  const roles = user?.roles;

  if(!roles.some((role:any) => [Role.SUPERVISOR, Role.SUPPORT].includes(role))) {
    throw new AuthorizationError('Access denied. Insufficient privileges')
  }
}

// checks if current User has an active profile
export const checkForProfile =  async ({ user, session, error }: any) => {
  const { isActive, profileId, profileIsActive } = user ?? {};

  // console.log(user);
  // console.log(session);

  if (!user || !isActive) {
    throw new AuthenticationError(`User Account disabled. ${user.isComment ?? ''}`);
  }

  if(!profileId){
    const reason = !profileId
      ? 'User Profile required'
      : !profileIsActive
        ? 'Active User Profile required'
        : null
    throw new AuthorizationError(`Access Denied. ${reason}`);
  }
}

