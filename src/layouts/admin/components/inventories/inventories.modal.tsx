import { Button, Modal, Select, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import type { Warehouses } from "../../../../models/warehouses.ts";
import InventoryService from "../../../../services/operations/inventory.service.ts";
import { DatabaseTables } from "../../../../enums/tables.ts";
import dayjs from "dayjs";
import { DatePickerInput } from "@mantine/dates";
import { NotificationsService } from "../../../../services/notifications/notifications.service.ts";
import { FormValidationService } from "../../../../services/validatior/form-validation.service.ts";

interface InventoriesModalProps {
    open: boolean;
    refresh: any;
    close: any;
}

interface InventoriesFormValues {
    warehouse_id: number;
    date: string | null;
}

export default function InventoriesModal({
    open = false,
    close,
    refresh,
}: InventoriesModalProps) {
    const form = useForm<InventoriesFormValues>({
        initialValues: {
            warehouse_id: -1,
            date: dayjs().format("YYYY-MM-DD"),
        },
        validate: {
            warehouse_id: FormValidationService.validateWarehouseId,
        },
    });

    const [warehouses, setWarehouses] = useState<Warehouses[]>([]);

    useEffect(() => {
        (async () => await fetchWarehouses())();
    }, []);

    async function fetchWarehouses() {
        const service = InventoryService.getInstance();
        const data = await service.getAllRows(DatabaseTables.Warehouses);
        setWarehouses(data);
    }

    async function handleSubmit() {
        try {
            const service = InventoryService.getInstance();

            await service.addInventory(form.getValues());

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
            title={"Add Inventory"}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="xs">
                    <Select
                        {...form.getInputProps('warehouse_id')}
                        value={String(form.values.warehouse_id)}
                        onChange={(value) => {
                            if (value) {
                                form.setValues({
                                    warehouse_id: Number(value),
                                });
                            }
                        }}
                        required
                        searchable
                        label={"Warehouse"}
                        data={warehouses.map((s) => {
                            return { label: s.name!, value: String(s.id) };
                        })}
                    />
                    <DatePickerInput
                        {...form.getInputProps('date')}
                        label={"Date"}
                        required={true}
                        value={
                            form.values.date
                                ? new Date(form.values.date)
                                : new Date()
                        }
                        onChange={(e) => {
                            if (e) {
                                form.setValues({
                                    date: dayjs(e).format("YYYY-MM-DD"),
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
