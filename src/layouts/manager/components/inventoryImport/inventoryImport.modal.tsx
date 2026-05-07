import {Button, Modal, NumberInput, Select, Stack} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import OperationService from "../../../../services/operations/operationService.ts";
import { DatabaseTables } from "../../../../enums/tables.ts";
import { NotificationsService } from "../../../../services/notifications/notifications.service.ts";
import {LocalStorage} from "../../../../enums/localStorage.ts";
import InventoryService from "../../../../services/operations/inventory/inventoryService.ts";
import {FormValidationService} from "../../../../services/validatior/form-validation.service.ts";
// import {DateTimePicker} from "@mantine/dates";
// import dayjs from "dayjs";

interface InventoriesModalProps {
    open: boolean;
    refresh: any;
    close: any;
}

interface InventoriesFormValues {
    quantity: number;
    item_id: number;
    supplier_id: number;
    expired_at: string;
}

export default function ManagerInventoryImportModal({
                                             open = false,
                                             close,
                                             refresh,
                                         }: InventoriesModalProps) {

    const cachedData = localStorage.getItem(LocalStorage.userData);

    const [suppliers, setSuppliers] = useState<any[]>([]);

    const userData = JSON.parse(cachedData!)

    const form = useForm<InventoriesFormValues>({
        initialValues: {
            quantity: 0,
            item_id: -1,
            supplier_id: -1,
            expired_at: "",
        },
        validate: {
            item_id: FormValidationService.validateItemId,
            quantity: FormValidationService.validateQuantity,
            supplier_id: FormValidationService.validateSupplierId,
        },
    });

    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        (async () => await fetchSuppliers())();
        (async () => await fetchItems())();
    }, []);

    async function fetchItems() {
        try {
            const service = OperationService.getInstance();
            const data = await service.getAllRows(DatabaseTables.Items);
            setItems(data);
        } catch (e: any) {

            NotificationsService.error("Fetch Items", e.toString());
        }
    }

    async function fetchSuppliers() {
        try {
            const service = OperationService.getInstance();
            const data = await service.getAllRows(DatabaseTables.Suppliers);
            setSuppliers(data);

            localStorage.setItem(DatabaseTables.Suppliers, JSON.stringify(data));
        } catch (e: any) {
            NotificationsService.error("Fetch Suppliers", e.toString());
        }
    }

    async function handleSubmit() {
        try {
            const service = InventoryService.getInstance();
            await service.addInventoryEntry({
                ...form.getValues(),
                warehouse_id: userData.warehouse_id,
            });

            refresh();
            handleClose();
            NotificationsService.success(
                `Add Inventory`,
                `New Inventory has been added successfully!`,
            );
        } catch (e: any) {
            console.log(e);
            NotificationsService.error(`Add Inventory`, e.toString());
        }
        refresh();
    }

    function handleClose() {
        form.reset();
        close();
    }

    return (
        <Modal
            opened={open}
            onClose={handleClose}
            centered
            title={"Import Inventory Item"}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="xs">
                    <Select
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

                    <Select
                        {...form.getInputProps('supplier_id')}
                        value={String(form.values.supplier_id)}
                        onChange={(value) => {
                            if (value) {
                                form.setValues({
                                    supplier_id: Number(value),
                                });
                            }
                        }}
                        required
                        searchable
                        label={"Supplier"}
                        data={suppliers.map((s) => {
                            return { label: s.name!, value: String(s.id) };
                        })}
                    />

                    <NumberInput
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

                    {/*<DateTimePicker*/}
                    {/*    label={"Expiration Date"}*/}
                    {/*    required={true}*/}
                    {/*    valueFormat="YYYY-MM-DD hh:mm A"*/}
                    {/*    value={*/}
                    {/*        form.values.expired_at*/}
                    {/*            ? new Date(form.values.expired_at)*/}
                    {/*            : new Date()*/}
                    {/*    }*/}
                    {/*    onChange={(e) => {*/}
                    {/*        if (e) {*/}
                    {/*            form.setValues({*/}
                    {/*                expired_at:*/}
                    {/*                    dayjs(e).format(*/}
                    {/*                        "YYYY-MM-DD hh:mm A",*/}
                    {/*                    ),*/}
                    {/*            });*/}
                    {/*        }*/}
                    {/*    }}*/}
                    {/*/>*/}

                    <Button type="submit" fullWidth mt="md">
                        Submit
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
}
