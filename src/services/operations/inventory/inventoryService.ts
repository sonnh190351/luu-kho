import DatabaseService from "../../database/database.service.ts";
import {DatabaseTables} from "../../../enums/tables.ts";
import {LogService} from "../log.service.ts";
import {LocalStorage} from "../../../enums/localStorage.ts";

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


    private async responseLog(response: any, data: any, fn_name: string) {
        if(response.error) {
            await LogService.getInstance().writeLog(
                fn_name,
                {
                    ...response.error
                }
            )
        } else {
            await LogService.getInstance().writeLog(
                fn_name,
                data
            )
        }
    }

    private async checkOrderAvailability(data: any): Promise<boolean> {
        console.log(data)
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

        await this.responseLog(response, "Edit Order Entry", data)
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

        await this.responseLog(response, "Add Order Entry", data)
    }

    public async addInventoryEntry(data: any) {
        const response = await this.database.add(DatabaseTables.Inventories, {
            ...data,
            warehouse_id: this.userData.warehouses.id
        });

        await this.responseLog(response, "Add Inventory Entry", data)
    }

    public async addProductItem(data: any) {

        const matching = await this.database.getByField(
            DatabaseTables.ProductItems, 'item_id', data.item_id
        )

        if(matching.error) {
            throw matching.error.message;
        }

        if(matching.data!.length > 0) {
            throw `Already exists this item in the product!`
        }

        const response = await this.database.add(DatabaseTables.ProductItems, data)

        await this.responseLog(response, "Add Inventory Entry", data)
    }

    public async editProductItem(data: any) {

        const matching = await this.database.getByField(
            DatabaseTables.ProductItems, 'id', data.id
        )
        if(matching.error) {
            throw matching.error.message;
        }

        if(matching.data!.length === 0) {
            throw `Does not exist this item in the product!`
        }

        const response = await this.database.edit(DatabaseTables.ProductItems, data.id, data)
        await this.responseLog(response, "Edit Inventory Entry", data)
    }

}