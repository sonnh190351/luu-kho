import DatabaseService from "../database/database.service.ts";
import {DatabaseTables} from "../../enums/tables.ts";
import {NotificationsService} from "../notifications/notifications.service.ts";
import {LogService} from "./log.service.ts";
import {LocalStorage} from "../../enums/localStorage.ts";

export default class ManagementService {

    private static instance: ManagementService;
    private readonly database: DatabaseService;

    private readonly userData: any;

    private constructor() {
        this.database = DatabaseService.getInstance();

        // Set user data
        const cacheData = localStorage.getItem(LocalStorage.userData);
        this.userData = JSON.parse(cacheData!)
    }

    public static getInstance(): ManagementService {
        if (!ManagementService.instance) {
            ManagementService.instance = new ManagementService();
        }

        return ManagementService.instance;
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

    public async getWarehouseInventoryItems(warehouse_id: number) {

        // get matching data
        const data = await this.database.getDatabase().from(DatabaseTables.Inventories).select(`
                id,
                created_at,
                updated_at,
                expired_at,
                quantity,
                items(
                    name,
                    tags,
                    quantity_type
                )
            `).in(
            'warehouse_id', [warehouse_id]
        )

        if(data.error) {
            NotificationsService.error(
                "Management Service",
                `Failed to get items: ${data.error}`,
            );
            return []
        }

        return data.data
    }
}