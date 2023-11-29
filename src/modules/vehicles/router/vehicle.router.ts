import { Elysia, t } from "elysia";
import VehicleController from "../controllers/vehicle.controller";
import { checkRoles } from "src/guards/permissions";
import { VehicleDTO } from "../models/vehicle.model";


function vehicleRouter(app: Elysia){
    return app

        // Guards all child routes under this "guard"
        .guard({
            beforeHandle: checkRoles
        },
        (app) => app.get('/guarded',()=>'guarded')
        )

        
        .get('/', (ctx)=> {
            return '[Vehicle Router]';
        }, {
            // Local guard only effective on this route
            beforeHandle: checkRoles
        })
    
        .get('/getone/:id', VehicleController.getOne, {
            params: t.Object({
                id: t.Numeric()
            })
        })

        .get('/getall', VehicleController.getAllVehicles
        )

        .post('/add', VehicleController.addVehicle, {
            
            response: {
                201: VehicleDTO
            } 
        })
    }
    

export default vehicleRouter;