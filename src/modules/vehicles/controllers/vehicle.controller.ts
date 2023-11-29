import { HttpStatusEnum } from "elysia-http-status-code/status";
import VehicleService from "../services/vehicle.service";
import { IVehicle } from "../models/vehicle.model";

class VehicleController {

    static getOne = async ({set, params: { id }}:any) => {
        // console.log('params: ',id);
        
        try {
            const whip = await VehicleService.findById(id);

            if(!whip){
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return 'No data found with that ID';
            }

            set.status = HttpStatusEnum.HTTP_200_OK
            return whip;
        } catch (error) {
            set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
            console.warn(error);
            
            return "Unable to retrieve data";
        }
    }
    
    static getAllVehicles = async (ctx:any) => {
        try {
            const whips = await VehicleService.findAll();
            ctx.set.status = HttpStatusEnum.HTTP_200_OK
            return whips;
        } catch (error) {
            ctx.set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
            console.warn(error);
            
            return "Unable to retrieve data";
        }
    }

    static addVehicle = async ({body, set}:any) => {
        try {
            // console.log(body);
            
            const r = await VehicleService.create(body);

            set.status = HttpStatusEnum.HTTP_201_CREATED;
            return r;
        } catch (error) {
            set.status = HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE;
            console.error(error);
            
            return 'Unable to add vehicle to database.'
        }
    };

}

export default VehicleController;