import DatabaseService from "../database/database.service.ts";
import {DatabaseTables} from "../../enums/tables.ts";
import { NotificationsService } from "../notifications/notifications.service.ts";

export default class OperationService {
    private static instance: OperationService;

    private database: DatabaseService;

    private constructor() {
        this.database = DatabaseService.getInstance();
    }

    public static getInstance(): OperationService {
        if (!OperationService.instance) {
            OperationService.instance = new OperationService();
        }

        return OperationService.instance;
    }

    public async getAllMatching(
        table: DatabaseTables,
        column: string,
        value: any,
    ) {
        const response = await this.database.getByField(table, column, value);

        if (response.error) {
            NotificationsService.error(
                "Inventory Service",
                `Failed to get items: ${response.error}`,
            );
            return [];
        }

        return response.data;
    }

    public async getAllWarehousesOrders() {
        const db =  this.database.getDatabase();

        const response = await db.from(DatabaseTables.Orders).select(
            `
            id,
            created_at,
            quantity,
            status,
            products(
                id,
                name
            ),
            users(
                first_name,
                last_name,
                email
            )
            `
        )

        if (response.error) {
            NotificationsService.error(
                "Inventory Service",
                `Failed to get orders: ${response.error}`,
            );
            return [];
        }

        return response.data;
    }

    public async getWarehouseOrders(warehouse_id: number) {
        const db =  this.database.getDatabase();

        const response = await db.from(DatabaseTables.Orders).select(
            `
            id,
            created_at,
            quantity,
            status,
            remark,
            products(
                id,
                name
            ),
            users(
                first_name,
                last_name,
                email
            )
            `
        ).eq("warehouse_id", warehouse_id);

        if (response.error) {
            NotificationsService.error(
                "Inventory Service",
                `Failed to get orders: ${response.error}`,
            );
            return [];
        }

        return response.data;
    }

    public async getAllInventoryItems() {
        const db = this.database.getDatabase();

        const response = await db
            .from(DatabaseTables.Inventories)
            .select(
                `
                id,
                created_at,
                updated_at,
                expired_at,
                quantity,
                items(
                    id,
                    name,
                    quantity_type,
                    warning_limit,
                    category_id
                ),
                warehouses(
                    id,
                    name,
                    address
                )
            `,
            )

        if (response.error) {
            NotificationsService.error(
                "Inventory Service",
                `Failed to get items: ${response.error}`,
            );
            return [];
        }
        return response.data;
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

    public async getAllItems() {
        const data = await this.database.getDatabase().from(DatabaseTables.Items).select(`
                id,
                name,
                created_at,
                updated_at,
                warning_limit,
                quantity_type,  
                tags,
                categories(
                    name
                )
            `)

        if(data.error) {
            NotificationsService.error(
                "Management Service",
                `Failed to get product items: ${data.error}`,
            );
            return []
        }

        return data.data
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

        return this.database.edit(table, data.id, data);
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

        return this.database.add(table, data);
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

        const response = await this.database.delete(table, id);

        if (response.error) {
            return `Reason: ${response.error.message}; ${response.error.details}`;
        }

        return ""
    }

    public async getWarehouseStatus(warehouse_id: number) {

        // get matching data
        const data = await this.database.getDatabase().from(DatabaseTables.InventoryStatus).select(`
                id,
                created_at,
                quantity,
                items(
                    id,
                    name,
                    quantity_type,
                    warning_limit,
                    category_id
                )
            `).in(
            'warehouse_id', [warehouse_id]
        )

        if(data.error) {
            NotificationsService.error(
                "Management Service",
                `Failed to get warehouse status: ${data.error}`,
            );
            return []
        }

        return data.data
    }

    public async getWarehouseInventoryItems(warehouse_id: number) {

        // get matching data
        const data = await this.database.getDatabase().from(DatabaseTables.Inventories).select(`
                id,
                created_at,
                updated_at,
                quantity,
                items(
                    id,
                    name,
                    quantity_type,
                    warning_limit,
                    category_id
                ),
                suppliers(
                    name
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

    public async getProductsItems(){
        // get matching data
        const data = await this.database.getDatabase().from(DatabaseTables.Products).select(`
                id,
                created_at,
                name
            `)

        if(data.error) {
            console.log(data)
            NotificationsService.error(
                "Management Service",
                `Failed to get product items: ${data.error}`,
            );
            return []
        }

        return data.data
    }

    public async getProductDetails(product_id: number) {
        const data = await this.database.getDatabase().from(DatabaseTables.Products).select(`
                id,
                created_at,
                name,
                product_items(
                    id,
                    quantity,
                    items (
                        id,
                        name,
                        quantity_type
                    )
                )
            `).eq('id', product_id)

        if(data.error) {
            NotificationsService.error(
                "Management Service",
                `Failed to get product item details: ${data.error}`,
            );
            return []
        }

        if(data.data.length === 0) {
            NotificationsService.error(
                "Management Service",
                `Failed to get product item details: Does not exist any product details with id ${product_id}`,
            );
            return undefined
        }

        return data.data[0]
    }
}
