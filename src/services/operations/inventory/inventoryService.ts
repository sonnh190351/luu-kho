import DatabaseService from "../../database/database.service.ts";
import {DatabaseTables} from "../../../enums/tables.ts";
import {LogService} from "../log.service.ts";
import {LocalStorage} from "../../../enums/localStorage.ts";
import {LOG_ACTIONS} from "../../../enums/log.ts";

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


    private async responseLog(response: any, fn_name: string, data: any,) {
        if (response.error) {
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

    private async checkOrderAvailability(data: any): Promise<any[]> {
        // List item du kien se tru
        const items = []

        // Check remaining items in inventory. If not available, return false
        const products = await this.database.getDatabase().from(DatabaseTables.ProductItems).select().eq('product_id', data.product_id)

        if (products.error) { throw products.error.message }
        // Keep track inventory data
        const currentProducts = []

        for (let i = 0; i < products.data.length; i++) {
            const productItem = products.data[i]

            const currentProduct = await this.database.getDatabase().from(DatabaseTables.InventoryStatus).select()
                .eq('warehouse_id', this.userData.warehouses.id)
                .eq('item_id', productItem.item_id)

            if (currentProduct.error) { throw currentProduct.error.message }

            if (currentProduct.data.length === 0) {
                throw `Inventory does not contain item: "${productItem.item_id}"`
            }

            const currentProductData = currentProduct.data[0]
            if (currentProductData.quantity < productItem.quantity * data.quantity) {
                throw `Not enough ingredients in Inventory for item: ${productItem.id}! Please refill!`
            }

            currentProducts.push({
                id: currentProductData.id,
                quantity: currentProductData.quantity - (productItem.quantity * data.quantity)
            })

            // Keep track item
            items.push({
                item_id: productItem.item_id,
                quantity: productItem.quantity * data.quantity
            })
        }

        // Update remaining items in inventory.
        for (let i = 0; i < currentProducts.length; i++) {
            console.log(currentProducts[i])
            await this.database.getDatabase().from(DatabaseTables.InventoryStatus)
                .update({ 'quantity': currentProducts[i].quantity })
                .eq('id', currentProducts[i].id,)
        }

        console.log(items)
        return items
    }

    public async editOrderEntry(data: any) {
        const exists = await this.database.isExist(DatabaseTables.Orders, 'id', data.id)
        if (!exists) {
            throw `Does not exist order with id: ${data.id}`
        }

        const response = await this.database.edit(DatabaseTables.Orders,
            data.id, {
                ...data,
            })

        await this.responseLog(response, LOG_ACTIONS.EDIT_ORDER, data)
    }

    public async addOrderEntry(data: any) {
        // Check ton tai cua warehouse
        const existsWarehouse = await this.database.isExist(DatabaseTables.Warehouses, 'id', this.userData.warehouses.id)
        if (!existsWarehouse) {
            throw `Does not exist warehouse with id: ${this.userData.warehouses.id}`
        }

        // Check the possibility of the order
        const items = await this.checkOrderAvailability(data)

        // Proceed create order
        const response = await this.database.add(DatabaseTables.Orders, {
            ...data,
            warehouse_id: this.userData.warehouses.id,
            user_id: this.userData.id
        })

        // Tao phieu xuat kho cho tung item trong order
        for (let i = 0; i < items.length; i++) {
            const item = items[i]

            // Tao phieu xuat kho
            await this.database.add(DatabaseTables.InventoriesExport, {
                order_id: response.data.id,
                quantity: item.quantity,
                item_id: item.item_id,
                warehouse_id: this.userData.warehouses.id
            })
        }

        // Log ket qua
        await this.responseLog(response, LOG_ACTIONS.ADD_ORDER, data)
    }

    public async addInventoryEntry(data: any) {
        const existsWarehouse = await this.database.isExist(DatabaseTables.Warehouses, 'id', this.userData.warehouses.id)
        if (!existsWarehouse) {
            throw `Does not exist warehouse with id: ${this.userData.warehouses.id}`
        }
        // Tạo phiếu nhập kho
        const response = await this.database.add(DatabaseTables.InventoriesImport, {
            ...data, warehouse_id: this.userData.warehouses.id
        });
        // Update status của kho
        const exist = await this.database.getDatabase()
            .from(DatabaseTables.InventoryStatus).select()
            .eq('warehouse_id', this.userData.warehouses.id)
            .eq('item_id', data.item_id)

        if (exist.error) { throw exist.error.message }

        if (exist.data!.length > 0) {
            // Nếu đã tồn tại, update thêm vào
            const currentItem = exist.data[0]
            await this.database.getDatabase().from(DatabaseTables.InventoryStatus).update({
                'quantity': data.quantity + currentItem.quantity
            }).eq('id', currentItem.id)
        } else {
            // Chưa tồn tại, thì tạo mới
            await this.database.getDatabase().from(DatabaseTables.InventoryStatus).insert({
                item_id: data.item_id,
                warehouse_id: this.userData.warehouses.id,
                quantity: data.quantity
            })
        }
        await this.responseLog(response, LOG_ACTIONS.ADD_INVENTORY, data)
    }

    public async addProductItem(data: any) {

        const matching = await this.database.getDatabase().from(DatabaseTables.ProductItems).select().eq(
            'item_id', data.item_id
        ).eq('product_id', data.product_id)

        if (matching.error) {
            throw matching.error.message;
        }

        if (matching.data!.length > 0) {
            throw `Already exists this item in the product!`
        }

        const response = await this.database.add(DatabaseTables.ProductItems, data)

        await this.responseLog(response, LOG_ACTIONS.ADD_PRODUCT, data)
    }

    public async editProductItem(data: any) {
        const matching = await this.database.getByField(
            DatabaseTables.ProductItems, 'id', data.id
        )

        if (matching.error) {
            throw matching.error.message;
        }

        if (matching.data!.length === 0) {
            throw `Does not exist this item in the product!`
        }

        const existing = await this.database.getDatabase().from(DatabaseTables.ProductItems).select()
            .eq('item_id', data.item_id)
            .eq('product_id', data.product_id)

        if (existing.error) {
            throw existing.error.message
        }

        if (existing.data!.length > 0) {
            if (existing.data![0].id !== data.id) {
                throw `Already exists this item in the product!`
            }
        }

        const response = await this.database.edit(DatabaseTables.ProductItems, data.id, data)
        await this.responseLog(response, LOG_ACTIONS.EDIT_PRODUCT, data)
    }

}