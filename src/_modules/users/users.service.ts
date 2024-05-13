import { NotFoundError } from "elysia";
import { Prisma, Profile, Role, User  } from "@prisma/client";
import { db } from "~config/prisma";
import { Resend } from "resend";
import consts from "~config/consts";
// import { minioClient } from "~config/minioClient";
// import { FilesService } from "~modules/files";

const resend = new Resend(Bun.env.RESEND_API_KEY);
export default class UsersService {

    async getAll(isActive?: boolean, profiles?: boolean){
        try {
            return db.user.findMany({
                where: { isActive: isActive ?? undefined },
                select: {
                    id: true,
                    firstname: true,
                    lastname: true,
                    roles: true,
                    email: true,
                    emailVerified: true,
                    profile: profiles ?? false,
                    profileId: true,
                    phone: true,
                    isActive: true,
                    isComment: true,
                    createdAt: true
                }
            });
        } catch (error) {
            console.error("Could not get all users. ",error);
            throw `Unable to retrieve ${isActive ? 'active' : 'deactivated'} Users`;
        }
        
    }

    // Returns a unique User from the DB with particular ID string
    async getUser(userId: string, opts?:{ profile?:boolean }): Promise<Partial<User>> {
        try {
            const user: Partial<User>|null = await db.user.findUnique({
                where: { id: userId },
                include: {
                    profile: opts?.profile ?? false,
                    authSession: false,
                }
            });

            if(!user) throw new NotFoundError('Could not find user with that ID');

            delete user.hashedPassword;
            delete user.google_id;
            delete user.apple_id;
            delete user.microsoft_id;
            delete user.facebook_id;

            return user;
        } catch (error) {
            console.error(error);
            throw error
        }
    }

    async createUserProfile(data: any): Promise<Profile> {
        const { firstname, lastname, documentId, documentType, gender, bio, email, phone,
            supportLevel, userId, photoId } = data;
        try {
            console.log("Received User Profile data: ",data);
            
            // Create new User Profile
            // const updatedUser = await db.user.update({
            //     where:{
            //         id: userId
            //     },
            //     data:{
            //         profile: {
            //             create: {
            //                 firstname, lastname, documentId, documentType,
            //                 gender, bio, email, phone, supportLevel, photoId
            //             }
            //         }
            //     },
            //     include: { profile:true }
            // })


            const newProf: Profile = await db.profile.create({
                data: {...data },
                include: {
                    user: true
                }
            });

            await db.user.update({
                where:{
                    id: userId
                },
                data:{
                    profileId: newProf.id
                    // profile: {
                    //     connect: {
                    //         firstname, lastname, documentId, documentType,
                    //         gender, bio, email, phone, supportLevel, photoId
                    //     }
                    // }
                }
            })

            if(!newProf){
                throw 'Could not create User Profile'
            }

            // delete newProf.user.hashedPassword;
            // delete newProf.user.google_id;
            // delete newProf.user.apple_id;
            // delete newProf.user.microsoft_id;
            // delete newProf.user.facebook_id;

            return newProf;
        } catch(e) {
            console.error("Could not persist new profile");
            throw e
        }
    }

    
    // async updateUserRole(userId: string, opts?: { role?: string}){
    //     try {
    //         const user = await auth.updateUserAttributes(
    //             userId,
    //             {
    //                 roles: [...opts?.role ?? []]
    //             } // expects partial `Lucia.DatabaseUserAttributes`
    //         );
    //         return user;
    //     } catch (e) {
    //         if (e instanceof LuciaError && e.message === `AUTH_INVALID_USER_ID`) {
    //             // invalid user id
    //             return 'That User does not exist'
    //         }
    //         // provided user attributes violates database rules (e.g. unique constraint)
    //         // or unexpected database errors

    //     }
    // }

    modifyRoles = {
         add(roles:Role[], newRole: Role, replaceRole: Role): Role[] {

            const replaceIndex = roles.indexOf(replaceRole);

            if (replaceIndex !== -1) {
                // If the new role already exists, replace it
                roles[replaceIndex] = newRole;
            } else {
                // If the new role doesn't exist, append it
                roles.push(newRole);
            }
        
            return roles;
        },
        
        remove(roles:Role[], removeRole: Role): Role[] {

            const removeIndex = roles.indexOf(removeRole);

            if (removeIndex !== -1) {
                // If the role already exists, remove it
                roles.splice(removeIndex, 1);
            }
        
            return roles;
        }
    }
    
    async getProfileById(userId:string, opts?:{
        ownedProperty:boolean, managedProperty:boolean, wallet:boolean, usedCoupons:boolean, reviews:boolean, user:boolean
    }){
        try {
            const profile = await db.profile.findUnique({ where: {
                userId: userId
            }, include: {
                user: opts?.user ? true : false,
            }})

            if(!profile) throw new NotFoundError(`Profile for "${userId}" not found`);

            return profile;
        } catch (error) {
            throw error
        }
    }

    // async uploadPhoto(photo: File): Promise<{etag:string; versionId:string|null}|null> {
    //     try{
    //         const bucketCheck = await filesService.pingUserImageBucket();
    //         if(bucketCheck === false || !bucketCheck) {
    //             console.warn('Image storage service is unavailable');
    //             return null;
    //         };

    //         return await filesService.uploadUserPhoto(photo);
    //     } catch(err) {
    //         // console.error(err);
    //         // return null
    //         throw err
    //     }
    // }

    static async sendEmailToUser(userProfile:Partial<Profile>, message:string, subject?:string){
        console.log(`Sending message to ${userProfile.firstname}`);
        // TODO: Implement timeout to limit the resends

        try {
            await resend.emails.send({
                from: consts.server.email, // 'onboarding@resend.dev',
                to: userProfile?.email!,
                subject: subject ?? `System message | ${consts.server.name}`,
                html: message,
            });
        } catch (error) {
            console.error(error);
            
            throw 'Could not send email.'
        }
    }
}