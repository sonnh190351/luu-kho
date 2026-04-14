import {Button, Modal, NumberInput, Select, Stack} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import OperationService from "../../../../services/operations/operationService.ts";
import { DatabaseTables } from "../../../../enums/tables.ts";
import dayjs from "dayjs";
import {DateTimePicker} from "@mantine/dates";
import { NotificationsService } from "../../../../services/notifications/notifications.service.ts";
import InventoryService from "../../../../services/operations/inventory/inventoryService.ts";
import {FormValidationService} from "../../../../services/validatior/form-validation.service.ts";

interface InventoriesModalProps {
    open: boolean;
    refresh: any;
    close: any;
}

interface InventoriesFormValues {
    quantity: number;
    expired_at: string;
    item_id: number;
}

export default function StaffInventoriesModal({
                                             open = false,
                                             close,
                                             refresh,
                                         }: InventoriesModalProps) {

    const form = useForm<InventoriesFormValues>({
        initialValues: {
            quantity: 0,
            item_id: -1,
            expired_at: dayjs(new Date()).format(
                "YYYY-MM-DD hh:mm A",
            ),
        },
        validate: {
            item_id: FormValidationService.validateItemId,
            quantity: FormValidationService.validateQuantity,
        },
    });

    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
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

    async function handleSubmit() {
        try {
            const service = InventoryService.getInstance();
            await service.addInventoryEntry({
                ...form.getValues(),
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
            title={"Add Inventory Item"}>
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

                    <DateTimePicker
                        label={"Expiration Date"}
                        required={true}
                        valueFormat="YYYY-MM-DD hh:mm A"
                        value={
                            form.values.expired_at
                                ? new Date(form.values.expired_at)
                                : new Date()
                        }
                        onChange={(e) => {
                            if (e) {
                                form.setValues({
                                    expired_at:
                                        dayjs(e).format(
                                            "YYYY-MM-DD hh:mm A",
                                        ),
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
    );
}
