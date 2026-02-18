import DatabaseService from "../database/database.service.ts";
import { DatabaseTables } from "../../enums/tables.ts";
import { NotificationsService } from "../notifications/notifications.service.ts";

export default class InventoryService {
    private static instance: InventoryService;

    private database: DatabaseService;

    private constructor() {
        this.database = DatabaseService.getInstance();
    }

    public static getInstance(): InventoryService {
        if (!InventoryService.instance) {
            InventoryService.instance = new InventoryService();
        }

        return InventoryService.instance;
    }

    public async getAllRows(table: DatabaseTables) {
        const response = await this.database.getAll(table);

        if (response.error) {
            NotificationsService.error(
                "Inventory Service",
                `Failed to get items: ${response.error}`,
            );
            return [];
        }

        return response.data;
    }

    public async editItemName(table: DatabaseTables, data: any) {
        const matching = await this.database.getByField(
            table,
            "name",
            data.name,
        );

        if (matching.error) {
            throw matching.error;
        }

        if (!matching.data) {
            throw `Invalid response data!`;
        }

        if (matching.data.length > 0) {
            for (let i = 0; i < matching.data.length; i++) {
                if (matching.data[i].id !== data.id) {
                    throw `Duplicate name in table: "${data.name}"!`;
                }
            }
        }

        return await this.database.edit(table, data.id, {
            name: data.name,
        });
    }

    public async addInventory(data: any) {
        const db = this.database.getDatabase();

        const matching = await db
            .from(DatabaseTables.Inventories)
            .select()
            .eq("date", data.date)
            .eq("warehouse_id", data.warehouse_id);

        if (matching.error) {
            throw matching.error;
        }

        if (!matching.data) {
            throw `Invalid response data!`;
        }

        if (matching.data.length > 0) {
            throw `Duplicate inventory of date and warehouse in table: "${data.name}"!`;
        }

        return await this.database.add(DatabaseTables.Inventories, data);
    }

    public async addItemWithUniqueName(table: DatabaseTables, data: any) {
        const matching = await this.database.getByField(
            table,
            "name",
            data.name,
        );

        if (matching.error) {
            throw matching.error;
        }

        if (!matching.data) {
            throw `Invalid response data!`;
        }

        if (matching.data.length > 0) {
            throw `Duplicate name in table: "${data.name}"!`;
        }

        return await this.database.add(table, data);
    }

    public async deleteById(table: DatabaseTables, id: number) {
        const matching = await this.database.getByField(table, "id", id);

        if (matching.error) {
            throw matching.error;
        }

        if (!matching.data) {
            throw `Invalid response data!`;
        }

        if (matching.data.length == 0) {
            throw `Cannot find matching id: "${id}"!`;
        }

        await this.database.delete(table, id);
    }
}
