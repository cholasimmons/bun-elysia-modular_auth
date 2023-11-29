import { Elysia, t } from "elysia";

const websocketRouter = new Elysia({name: "Websockets Client", websocket: { idleTimeout:10 }});

websocketRouter
.ws('/', {
    message(ws, received) {
        console.log('Received: ',received, ' time: ',new Date().toDateString());
        
        ws.send({response: "Your message was well received!", time: Date.now()})
    }
})
.ws('/two', {
    message(ws, received) {
        ws.send({received, msg: "No Date"})
    }
})


export default websocketRouter;