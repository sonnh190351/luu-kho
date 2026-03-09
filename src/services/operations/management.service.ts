import DatabaseService from "../database/database.service.ts";
import {DatabaseTables} from "../../enums/tables.ts";
import {NotificationsService} from "../notifications/notifications.service.ts";

export default class ManagementService {
    private static instance: ManagementService;

    private constructor() {
    }

    public static getInstance(): ManagementService {
        if (!ManagementService.instance) {
            ManagementService.instance = new ManagementService();
        }

        return ManagementService.instance;
    }

    public async getWarehouseInventoryItems(warehouse_id: number) {

        // get matching data
        const data = await DatabaseService.getInstance().getDatabase().from(DatabaseTables.Inventories).select(`
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