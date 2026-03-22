import DatabaseService from "../database/database.service.ts";
import {DatabaseTables} from "../../enums/tables.ts";
import {NotificationsService} from "../notifications/notifications.service.ts";
import {LogService} from "./log.service.ts";
import {LocalStorage} from "../../enums/localStorage.ts";

export default class InventoryService {

    private static instance: InventoryService;
    private readonly database: DatabaseService;

    private readonly userData: any;

    private constructor() {
        this.database = DatabaseService.getInstance();

        // Set user data
        const cacheData = localStorage.getItem(LocalStorage.userData);
        this.userData = JSON.parse(cacheData!)
    }

    public static getInstance(): InventoryService {
        if (!InventoryService.instance) {
            InventoryService.instance = new InventoryService();
        }

        return InventoryService.instance;
    }

    private async checkOrderAvailability(data: any): boolean {

        // Check remaining items in inventory. If not available, return false

        // Update remaining items in inventory. If failed to update, return false

        return true
    }

    public async editOrderEntry(data: any) {
        // TO-DO: Check availability of order

        const response = await this.database.edit(DatabaseTables.Orders,
            data.id,{
            ...data,
        })

        if(response.error) {
            await LogService.getInstance().writeLog(
                "Edit Order Entry",
                {
                    ...response.error
                }
            )
        } else {
            await LogService.getInstance().writeLog(
                "Edit Order Entry",
                data
            )
        }
    }

    public async addOrderEntry(data: any) {
        // Check the possibility of the order
        await this.checkOrderAvailability(data)

        // Proceed create order
        const response = await this.database.add(DatabaseTables.Orders, {
            ...data,
            warehouse_id: this.userData.warehouses.id,
            user_id: this.userData.id
        })

        if(response.error) {
            await LogService.getInstance().writeLog(
                "Add Order Entry",
                {
                    ...response.error
                }
            )
        } else {
            await LogService.getInstance().writeLog(
                "Add Order Entry",
                data
            )
        }
    }

    public async addInventoryEntry(data: any) {


        const response = await this.database.add(DatabaseTables.Inventories, {
            ...data,
            warehouse_id: this.userData.warehouses.id
        });

        if(response.error) {
            await LogService.getInstance().writeLog(
                "Add Inventory Entry",
                {
                    ...response.error
                }
            )
        } else {
            await LogService.getInstance().writeLog(
                "Add Inventory Entry",
                data
            )
        }

        return
    }
}