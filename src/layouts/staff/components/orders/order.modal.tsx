import {Button, Modal, NumberInput, Select, Stack, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {OrderStatus} from "../../../../enums/orders.ts";
import {useEffect, useState} from "react";
import OperationService from "../../../../services/operations/operationService.ts";
import {DatabaseTables} from "../../../../enums/tables.ts";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import InventoryService from "../../../../services/operations/inventory/inventoryService.ts";
import {FormValidationService} from "../../../../services/validatior/form-validation.service.ts";

interface OrderModalProps {
    order: any;
    open: boolean;
    close: any;
    refresh: any
}

interface OrderFormValues {
    product_id: number;
    quantity: number;
    remark: string;
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
            remark: "",
            status: OrderStatus.RECEIVED
        },
        validate: {
            product_id: FormValidationService.validateProductId,
            quantity: FormValidationService.validateQuantity,
            status: FormValidationService.validateStatus,
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
                remark: order.remark,
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

    // Event xu li luc tao order
    async function handleSubmit() {
        try {
            const service = InventoryService.getInstance()

            if(isEdit) {
                if(order.status === OrderStatus.PROCESSING) {
                    const currStatus = form.getValues()['status']
                    if (currStatus == OrderStatus.RECEIVED) {
                        NotificationsService.error("Order Manage", "Cannot update a processing order status to be received!")
                        return
                    }
                }

                // Update trang thai order
                await service.editOrderEntry({
                    id: order.id,
                    ...form.getValues()
                })
            } else {
                // Tao order moi
                // - Update trang thai kho
                // - Tao export inventory data
                await service.addOrderEntry(form.getValues())
            }

            refresh()
            handleClose()
        } catch (e: any) {
            NotificationsService.error("Order Manage", e.toString());
        }
    }

    function handleClose() {
        close()
        setTimeout(() => {
            form.reset()
        }, 200)
    }

    const statusData = Object.entries(OrderStatus).map(([_, value]) => {
        return { label: value, value: value };
    })

    return (
        <Modal opened={open} onClose={handleClose} centered
               title={"Staff Order Manage"}>
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
                        label={"Status"}
                        data={statusData}
                    />

                    <TextInput {...form.getInputProps('remark')} label={"Remark"} />

                    <Button onClick={handleSubmit} fullWidth>Submit</Button>
                </Stack>
            </form>
        </Modal>
    )
}