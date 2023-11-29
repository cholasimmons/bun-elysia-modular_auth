import { db } from '~config/prisma';
import { auth } from '~config/lucia';
import { HttpStatusEnum } from 'elysia-http-status-code/status';
import { t } from 'elysia';
import { IVehicle } from '../models/vehicle.model';

const cars = [
    { manufacturer: 'Mercedes Benz', year: 2012, color: 'black'},
    { manufacturer: 'Volkswagen', year: 2010, color: 'blue'},
]

export default class VehicleService{

    // Fetch one vehicles
    static async findById(id: number){
        return await db.vehicle.findUnique({
            where: {
                id: id
            }
        })        
        // set.header = {'Content-Type': 'application/json'};
        // set.status = HttpStatusEnum.HTTP_200_OK
        // return cars;
    }

    // View all vehicles
    static async findAll(){
        return await db.vehicle.findMany()        
        // set.header = {'Content-Type': 'application/json'};
        // set.status = HttpStatusEnum.HTTP_200_OK
        // return cars;
    }

    // Register a new Vehicle
    static async create(body:any){
        return db.vehicle.create({
            data: body
        });
    }
}