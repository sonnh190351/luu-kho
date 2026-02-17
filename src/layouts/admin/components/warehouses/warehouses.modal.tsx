import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import type { Warehouses } from "../../../../models/warehouses.ts";
import { useEffect } from "react";
import InventoryService from "../../../../services/operations/inventory.service.ts";
import { NotificationsService } from "../../../../services/notifications/notifications.service.ts";
import { DatabaseTables } from "../../../../enums/tables.ts";

interface WarehousesModalProps {
    warehouse: Warehouses | null;
    open: boolean;
    refresh: any;
    close: any;
}

interface WarehousesFormValues {
    name: string;
    address: string;
}

export default function WarehousesModal({
    warehouse,
    open = false,
    close,
    refresh,
}: WarehousesModalProps) {
    const isEdit = Boolean(warehouse);

    const form = useForm<WarehousesFormValues>({
        initialValues: {
            name: "",
            address: "",
        },
        validate: {},
    });

    useEffect(() => {
        if (warehouse) {
            form.setValues({
                name: warehouse.name!,
                address: warehouse.address!,
            });
        }
    }, [isEdit]);

    function handleClose() {
        form.reset();
        close();
    }

    async function handleSubmit() {
        try {
            const service = InventoryService.getInstance();

            if (isEdit) {
                await service.editItemName(DatabaseTables.Warehouses, {
                    id: warehouse?.id,
                    ...form.getValues(),
                });
            } else {
                await service.addItemWithUniqueName(
                    DatabaseTables.Warehouses,
                    form.getValues(),
                );
            }

            refresh();
            handleClose();

            NotificationsService.success(
                `${isEdit ? "Edit" : "Add"} Warehouse`,
                "New warehouse has been added successfully!",
            );
        } catch (e: any) {
            NotificationsService.error(
                `${isEdit ? "Edit" : "Add"} Warehouse`,
                e.toString(),
            );
        }
    }

    return (
        <Modal
            opened={open}
            onClose={close}
            centered
            title={isEdit ? "Edit Warehouse" : "Add Warehouse"}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="xs">
                    <TextInput
                        required
                        label={"Name"}
                        value={form.values.name}
                        onChange={(e) =>
                            form.setValues({
                                name: e.target.value,
                            })
                        }
                    />
                    <TextInput
                        required
                        label={"Address"}
                        value={form.values.address}
                        onChange={(e) =>
                            form.setValues({
                                address: e.target.value,
                            })
                        }
                    />
                    <Button type="submit" fullWidth mt="md">
                        Submit
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
}
