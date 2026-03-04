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
        const inventories = await DatabaseService.getInstance().getByField(DatabaseTables.Inventories, 'warehouse_id', warehouse_id)
        if(inventories.error) {
            NotificationsService.error(
                "Management Service",
                `Failed to get items: ${inventories.error}`,
            );
            return []
        }

        // Mapping ID
        const ids = inventories.data.map((d) => d.id)

        // get matching data
        const data = await DatabaseService.getInstance().getDatabase().from(DatabaseTables.InventoryTickets).select(`
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
            'inventory_id', ids
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