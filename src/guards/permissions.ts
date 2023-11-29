// Define roles and permissions
export const permissions = {
    admin: ['create', 'read', 'update', 'delete'],
    supervisor: ['create', 'read', 'update'],
    editor: ['read', 'update'],
    viewer: ['read'],
};

// Middleware to check user roles
export const checkRoles = (ctx:any) => {
    // const userRoles = ctx.req.user.roles; // Extract roles from user object (assuming it's available in the request)
    const q = ctx.query;
    console.log(q.pass);

    if (q.pass === true.toString()) {
      
      
      // User has the required roles
      // console.log('ctx ',ctx);
      ctx.set.status = 200;
    } else {
      ctx.set.status = 403;
      return 'Unauthorized @Roles';
    }
  };