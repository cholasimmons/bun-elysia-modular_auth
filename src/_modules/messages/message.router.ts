// @ts-nocheck

import Elysia, { t } from "elysia";
import { checkAuth, checkForProfile, checkIsAdmin, checkIsStaff } from "~middleware/authChecks";
import { MessageController, MessageService, ViewMessageDTO } from ".";
import { MessageQueriesDTO, CreateMessageDTO } from "./message.model";
import { swaggerDetails } from "~utils/response_helper";

const messages = new MessageController();

export const MessageRouter = new Elysia({ prefix: '/messages',
    detail: { description:'Messaging System', tags: ['Messages'] }
})

    .onBeforeHandle([checkAuth, checkForProfile])

    /* GET */

    
    .get('/', messages.getMyMessages, {
        response: {
            200: t.Object({ data: t.Array(ViewMessageDTO), message: t.String({ default: 'Successfully retrieved 0 of your Messages' }) }),
            500: t.Object({ message: t.String({ default: 'Could not retrieve your Messages' }) })
        },
        detail: swaggerDetails('Get Messages [SELF]', 'Retrieve all of your Messages. [SELF]')
    })

    .get('/user/:profileId', messages.getMessagesByProfileId, {
        beforeHandle: [checkIsAdmin || checkIsStaff],
        params: t.Object({ profileId: t.String() }),
        response: {
            200: t.Object({ data: t.Array(ViewMessageDTO), message: t.String({ default: 'Successfully retrieved 0 Messages' }) }),
            500: t.Object({ message: t.String({ default: 'Could not retrieve Messages' }) })
        },
        detail: swaggerDetails('Get User\'s Messages [ADMIN|STAFF]', 'Retrieve all of a User\'s Messages by their Profile ID')
    })


    /* POST */


    .post('/send', messages.sendMessage, {
        // beforeHandle: [ checkIsAdmin || checkIsStaff ],
        body: CreateMessageDTO,
        query: MessageQueriesDTO,
        response: {
            200: t.Object({ data: ViewMessageDTO, message: t.String({ default: 'Successfully sent Message [Delivery Type]' }) }),
            500: t.Object({ message: t.String({ default: 'Unable to send Message' }) }),
        },
        detail: swaggerDetails('Send Message', 'Creates and sends a Message.')
    })


    /* PATCH */


    .patch('/read/:messageId', messages.markAsRead, {
        params: t.Object({ messageId: t.String() }),
        response: {
            204: t.Object({ data: t.Null(), message: t.String({ default: 'Message marked as read' }) }),
            500: t.Object({ message: t.String({ default: 'Unable to create Coupon' }) }),
        },
        detail: swaggerDetails('Mark Message', 'Marks message as read by Message ID')
    })
    
    .patch('/archive/:messageId', messages.markAsRead, {
        
    })


    /* DELETE */


    .delete('/messageId', messages.deleteMessage, {

    })