import {Button, Modal, NumberInput, Select, Stack} from "@mantine/core";
import {useForm} from "@mantine/form";
import {OrderStatus} from "../../../../enums/orders.ts";
import {useEffect, useState} from "react";
import OperationService from "../../../../services/operations/operationService.ts";
import {DatabaseTables} from "../../../../enums/tables.ts";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import InventoryService from "../../../../services/operations/inventoryService.ts";

interface OrderModalProps {
    order: any;
    open: boolean;
    close: any;
    refresh: any
}

interface OrderFormValues {
    product_id: number;
    quantity: number;
    status: OrderStatus
}

export default function StaffOrderModal({
                                            order,
                                            open = false,
                                            close,
                                            refresh,
                                        }: OrderModalProps) {
    const isEdit = Boolean(order);

    const [products, setProducts] = useState<any[]>([]);

    const form  = useForm<OrderFormValues>({
        initialValues: {
            product_id: -1,
            quantity: 0,
            status: OrderStatus.RECEIVED
        }
    })

    useEffect(() => {
        (async() => await fetchProducts())();
    }, []);

    useEffect(() => {
        if(order) {
            form.setValues({
                product_id: Number(order.products.id),
                quantity: order.quantity,
                status: order.status,
            })
        }
    }, [order]);

    async function fetchProducts() {
        try {
            const service = OperationService.getInstance();
            const data = await service.getAllRows(DatabaseTables.Products);
            setProducts(data);
        } catch (e: any) {
            NotificationsService.error("Fetch Products", e.toString());
        }
    }

    async function handleSubmit() {
        try {
            const service = InventoryService.getInstance()

            if(isEdit) {
                await service.editOrderEntry({
                    id: order.id,
                    ...form.getValues()
                })
            } else {
                await service.addOrderEntry(form.getValues())
            }

            refresh()
            close()
        } catch (e: any) {
            NotificationsService.error("Order Manage", e.toString());
        }
    }

    return (
        <Modal opened={open} onClose={close} centered
               title={"Order Manage"}>
            <form onSubmit={handleSubmit}>
                <Stack>
                    <Select
                        {...form.getInputProps('product_id')}
                        value={String(form.values.product_id)}
                        onChange={(value) => {
                            if (value) {
                                form.setValues({
                                    product_id: Number(value),
                                });
                            }
                        }}
                        disabled={isEdit}
                        required
                        searchable
                        label={"Product"}
                        data={products.map((s) => {
                            return { label: s.name!, value: String(s.id) };
                        })}
                    />

                    <NumberInput disabled={isEdit} {...form.getInputProps("quantity")} label={"Quantity"} required />

                    <Select
                        {...form.getInputProps('status')}
                        required
                        searchable
                        label={"Supplier"}
                        data={Object.entries(OrderStatus).map(([_, value]) => {
                            return { label: value, value: value };
                        })}
                    />

                    <Button onClick={handleSubmit} fullWidth>Submit</Button>
                </Stack>
            </form>
        </Modal>
    )
}