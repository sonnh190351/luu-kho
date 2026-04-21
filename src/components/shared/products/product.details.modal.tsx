import {Button, Modal, NumberInput, Select, Stack} from "@mantine/core";
import {useEffect, useState} from "react";
import OperationService from "../../../services/operations/operationService.ts";
import {DatabaseTables} from "../../../enums/tables.ts";
import {NotificationsService} from "../../../services/notifications/notifications.service.ts";
import {useForm} from "@mantine/form";
import {FormValidationService} from "../../../services/validatior/form-validation.service.ts";
import InventoryService from "../../../services/operations/inventory/inventoryService.ts";

interface ProductDetailsModalProps {
    product_details?: any;
    open: boolean;
    close: any
    refresh: any
    product_id: number
}

interface ProductDetailsForm {
    item_id: number;
    quantity: number;
}

export default function ProductDetailsModal({ open, close, refresh, product_details, product_id }: ProductDetailsModalProps) {
    const isEdit = Boolean(product_details);

    const [items, setItems] = useState<any[]>([]);

    const form = useForm<ProductDetailsForm>({
        initialValues: {
            item_id: -1,
            quantity: 0,
        },
        validate: {
            item_id: FormValidationService.validateItemId,
            quantity: FormValidationService.validateQuantity
        }
    })

    useEffect(() => {
        if(product_details) {
            form.setValues({
                item_id: product_details.items.id,
                quantity: product_details.quantity,
            })
        }
    }, [product_details]);

    useEffect(() => {
        (async () =>  await fetchItems())();
    }, []);

    async function fetchItems() {
        try {
            const service = OperationService.getInstance();
            const data = await service.getAllRows(DatabaseTables.Items);
            setItems(data);
        } catch (e: any) {
            NotificationsService.error("Fetch Dish Items", e.toString());
        }
    }

    async function handleSubmit() {
        try {
            const service = InventoryService.getInstance()
            if(isEdit) {
                await service.editProductItem({
                    id: product_details.id,
                    product_id: product_id,
                    ...form.getValues(),
                });
            } else {
                await service.addProductItem({
                    product_id: product_id,
                    ...form.getValues(),
                });
            }

            refresh()
            handleClose()
            NotificationsService.success(
                `${isEdit ? "Edit" : "Add"} Dish Item`,
                `New dish item has been added!`
            )
        } catch (e: any) {
            console.log(e);
            NotificationsService.error(`${isEdit ? "Edit" : "Add"} Dish Item`, e.toString());
        }
    }

    function handleClose() {
        close();
        setTimeout(() => {
            form.reset();
        }, 200)
    }

    return (
        <Modal title={`${isEdit ? "Edit" : "Add"} Dish Item`} centered={true} opened={open} onClose={handleClose}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="xs">
                    <Select
                        {...form.getInputProps('item_id')}
                        clearable
                        value={String(form.values.item_id)}
                        onChange={(value) => {
                            if (value) {
                                form.setValues({
                                    item_id: Number(value),
                                });
                            }
                        }}
                        required
                        searchable
                        label={"Item"}
                        data={items.map((s) => {
                            return {
                                label: s.name!,
                                value: String(s.id),
                            };
                        })}
                    />
                    <NumberInput
                        {...form.getInputProps('quantity')}
                        required
                        label={`Quantity`}
                        value={form.values.quantity}
                        onChange={(e) => {
                            if (e) {
                                form.setValues({
                                    quantity: Number(e),
                                });
                            }
                        }}
                    />
                    <Button type="submit" fullWidth mt="md">
                        Submit
                    </Button>
                </Stack>
            </form>
        </Modal>
    )
}