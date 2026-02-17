import { Button, Modal, Select, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import type { Inventories } from "../../../../models/inventories.ts";
import { useEffect, useState } from "react";
import type { Warehouses } from "../../../../models/warehouses.ts";
import InventoryService from "../../../../services/operations/inventory.service.ts";
import { DatabaseTables } from "../../../../enums/tables.ts";

interface InventoriesModalProps {
    inventory: Inventories | null;
    open: boolean;
    refresh: any;
    close: any;
}

interface InventoriesFormValues {
    warehouse_id: number;
}

export default function InventoriesModal({
    inventory,
    open = false,
    close,
    refresh,
}: InventoriesModalProps) {
    const isEdit = inventory !== null;

    const form = useForm<InventoriesFormValues>({
        initialValues: {
            warehouse_id: inventory ? inventory!.id : -1,
        },
        validate: {},
    });

    const [warehouses, setWarehouses] = useState<Warehouses[]>([]);

    useEffect(() => {
        (async () => await fetchWarehouses())();
    }, []);

    async function fetchWarehouses() {
        const service = InventoryService.getInstance();
        const data = await service.getAllRows(DatabaseTables.Suppliers);
        setWarehouses(data);
    }

    function handleSubmit() {
        refresh();
    }

    return (
        <Modal
            opened={open}
            onClose={close}
            centered
            title={isEdit ? "Edit Inventory" : "Add Inventory"}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="xs">
                    <Select
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

                    <Button type="submit" fullWidth mt="md">
                        Submit
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
}
