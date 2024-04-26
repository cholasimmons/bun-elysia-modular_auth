import { Role } from "@prisma/client";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import consts from "~config/consts";
import { lucia } from "~config/lucia"
import { db } from "~config/prisma";


// this checks Bearer token, if not supplied the request will be rejected!
export const checkCookieAuth =  async ({ set, session, request:{headers} }: any) => {
  try {
    if(!session){
      console.warn("Invalid authorization token.");
      
      set.status = HttpStatusEnum.HTTP_401_UNAUTHORIZED;
      return { message: 'Unauthorized Access' };
    }
    
  } catch (error) {
    console.warn(error);
  }
}


// Check user roles for Admin
export const checkIsAdmin = async ({ set, user }:any) => {
  if(!user.roles.some((role:any) => [Role.ADMIN].includes(role))) {
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