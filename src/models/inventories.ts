export interface Inventories {
    id: number;
    warehouses: any;
    items: any;
    quantity: number;
    created_at: string;
    updated_at: string | null;
    expired_at: string | null;
}
