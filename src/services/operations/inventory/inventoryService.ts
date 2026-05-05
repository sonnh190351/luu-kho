import DatabaseService from "../../database/database.service.ts";
import {DatabaseTables} from "../../../enums/tables.ts";
import {LogService} from "../log.service.ts";
import {LocalStorage} from "../../../enums/localStorage.ts";
import {LOG_ACTIONS} from "../../../enums/log.ts";

export default class InventoryService {

    private static instance: InventoryService;
    private readonly database: DatabaseService;

    private readonly userData: any;

    // "Singleton pattern" constructor
    // Định nghĩa:
    // đảm bảo một lớp (class) chỉ có duy nhất một thể hiện (instance) duy nhất trong suốt vòng đời ứng dụng.
    // Nó cung cấp một điểm truy cập toàn cục (global access point) để lấy thể hiện đó từ bất kỳ đâu
    //
    // Tại sao sử dụng:
    // 1. Quản lý tài nguyên: Sử dụng cho các đối tượng cần chia sẻ dùng chung, ví dụ: kết nối cơ sở dữ liệu
    // (Database Connection), Logging, Configuration manager.
    //
    // 2. Nhất quán dữ liệu: Tránh xung đột khi nhiều phần của hệ thống cố gắng khởi tạo cùng một loại đối tượng
    private constructor() {
        this.database = DatabaseService.getInstance();

        // Set user data
        const cacheData = localStorage.getItem(LocalStorage.userData);
        this.userData = JSON.parse(cacheData!)
    }

    // Hàm để lấy instance singleton
    public static getInstance(): InventoryService {
        if (!InventoryService.instance) {
            InventoryService.instance = new InventoryService();
        }

        return InventoryService.instance;
    }

    // Để log response của service function
    // Đảm bảo các hàm này đc log theo 1 format duy nhất
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

    // Hàm kiểm tra tính khả thở của order
    private async checkOrderAvailability(data: any): Promise<any[]> {
        // List item du kien se tru
        const items = []

        // Lấy list các items của dish
        const products = await this.database.getDatabase().from(DatabaseTables.ProductItems).select(
            `
            id,
            quantity,
            items (
                id,
                name
            )
            `
        ).eq('product_id', data.product_id)

        // Supabase service có vấn đề -> ném lỗi
        if (products.error) {
            throw products.error.message
        }

        // Keep track inventory data
        const currentProducts = []

        // Loop trong từng item trong dish
        for (let i = 0; i < products.data.length; i++) {
            const productItem = products.data[i]

            // Check tồn kho của từng nguyên liệu
            const currentProduct = await this.database.getDatabase().from(DatabaseTables.InventoryStatus).select()
                .eq('warehouse_id', this.userData.warehouses.id)
                .eq('item_id',
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    productItem.items.id
                )

            // Supabase service có vấn đề -> ném lỗi
            if (currentProduct.error) {
                throw currentProduct.error.message
            }

            // Nếu kho 0 tồn tại nguyện liệu đó -> ném lỗi
            if (currentProduct.data.length === 0) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                throw `Inventory does not contain item: "${productItem.items.id}"`
            }

            // Extract data hiện thời của kho
            const currentProductData = currentProduct.data[0]

            if (currentProductData.quantity < productItem.quantity * data.quantity) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                throw `Not enough ingredients in Warehouse Inventory for item: ${productItem.items.name}! Please refill!`
            }

            // Thêm nguyên liệu phải update trong kho vào list
            currentProducts.push({
                id: currentProductData.id,
                quantity: currentProductData.quantity - (productItem.quantity * data.quantity)
            })

            // Keep track item
            items.push({
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                item_id: productItem.items.id,
                quantity: productItem.quantity * data.quantity
            })
        }

        // Update remaining items in inventory.
        for (let i = 0; i < currentProducts.length; i++) {
            await this.database.getDatabase().from(DatabaseTables.InventoryStatus)
                .update({'quantity': currentProducts[i].quantity})
                .eq('id', currentProducts[i].id,)
        }

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
                order_id: response.data!.id,
                quantity: item.quantity,
                item_id: item.item_id,
                warehouse_id: this.userData.warehouses.id
            })
        }

        // Log ket qua
        await this.responseLog(response, LOG_ACTIONS.ADD_ORDER, data)
    }

    // Hàm tạo phiueeus nhập kho
    public async addInventoryEntry(data: any) {

        // Check tồn tại của kho
        const existsWarehouse = await this.database.isExist(DatabaseTables.Warehouses, 'id', this.userData.warehouses.id)
        if (!existsWarehouse) {
            throw `Does not exist warehouse with id: ${this.userData.warehouses.id}`
        }

        // Tạo phiếu nhập kho
        const response = await this.database.add(DatabaseTables.InventoriesImport, {
            ...data,
            warehouse_id: this.userData.warehouses.id
        });

        // Check tồn tại của item ở trong kho
        const exist = await this.database.getDatabase()
            .from(DatabaseTables.InventoryStatus).select()
            .eq('warehouse_id', this.userData.warehouses.id)
            .eq('item_id', data.item_id)

        // Nếu supabase server có lỗi -> ném lỗi ra
        if (exist.error) {
            throw exist.error.message
        }

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
                quantity: data.quantity,
            })
        }

        // Log kết quả
        await this.responseLog(response, LOG_ACTIONS.ADD_INVENTORY, data)
    }

    // Thêm thành phần món vào bảng
    public async addProductItem(data: any) {

        // CHeck xem món đã tồn tại thành phần đó chưa
        const matching = await this.database.getDatabase().from(DatabaseTables.ProductItems).select().eq(
            'item_id', data.item_id
        ).eq('product_id', data.product_id)

        if (matching.error) {
            throw matching.error.message;
        }

        // Đã có thành phần này trong món -> ném lỗi
        if (matching.data!.length > 0) {
            throw `Already exists this item in the product!`
        }

        const response = await this.database.add(DatabaseTables.ProductItems, data)

        await this.responseLog(response, LOG_ACTIONS.ADD_PRODUCT, data)
    }

    public async editProductItem(data: any) {
        // Check tồn tại của thành phần dish trong db
        const matching = await this.database.getByField(
            DatabaseTables.ProductItems, 'id', data.id
        )

        if (matching.error) {
            throw matching.error.message;
        }

        if (matching.data!.length === 0) {
            throw `Does not exist this item in the product!`
        }

        // Check tồn tại của item ở trong thành phần món
        // VD: bún đậu đã có chứa Đậu Mơ hay chưa?
        const existing = await this.database.getDatabase().from(DatabaseTables.ProductItems).select()
            .eq('item_id', data.item_id)
            .eq('product_id', data.product_id)

        if (existing.error) {
            throw existing.error.message
        }

        if (existing.data!.length > 0) {
            // Nếu món này đã chứa thành phần này
            if (existing.data![0].id !== data.id) {
                throw `Already exists this item in the product!`
            }
        }

        const response = await this.database.edit(DatabaseTables.ProductItems, data.id, data)
        await this.responseLog(response, LOG_ACTIONS.EDIT_PRODUCT, data)
    }

}