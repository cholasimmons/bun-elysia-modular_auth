// app.d.ts
/// <reference types="lucia" />
declare namespace Lucia {
	type Auth = import("./src/config/lucia.js").Auth;
	type DatabaseUserAttributes = {
        username:string;
        email:string;
        hash?:string;
        salt?:string;
		    email_verified?:boolean
    };
	type DatabaseSessionAttributes = {};
}