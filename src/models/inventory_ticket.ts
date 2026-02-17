export interface InventoryTicket {
    created_at: string
    expired_at: string | null
    id: number
    inventory_id: number | null
    item_id: number | null
    quantity: number | null
    updated_at: string | null
}