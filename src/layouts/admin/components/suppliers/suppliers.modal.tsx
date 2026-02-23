import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import type { Suppliers } from "../../../../models/suppliers.ts";
import { useEffect } from "react";
import InventoryService from "../../../../services/operations/inventory.service.ts";
import { NotificationsService } from "../../../../services/notifications/notifications.service.ts";
import { DatabaseTables } from "../../../../enums/tables.ts";
import UtilsService from "../../../../services/utils.ts";
import { FormValidationService } from "../../../../services/validatior/form-validation.service.ts";

interface SuppliersModalProps {
    supplier: Suppliers | null;
    open: boolean;
    refresh: any;
    close: any;
}

interface SuppliersFormValues {
    name: string;
    address: string;
}

export default function SuppliersModal({
    supplier,
    open = false,
    close,
    refresh,
}: SuppliersModalProps) {
    const isEdit = Boolean(supplier);

    const form = useForm<SuppliersFormValues>({
        initialValues: {
            name: "",
            address: "",
        },
        validate: {
            name: FormValidationService.validateName,
            address: FormValidationService.validateAddress,
        },
    });

    useEffect(() => {
        if (supplier) {
            form.setValues({
                name: supplier.name!,
                address: supplier.address!,
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
                await service.editItemName(DatabaseTables.Suppliers, {
                    id: supplier?.id,
                    ...form.getValues(),
                });
            } else {
                await service.addItemWithUniqueName(
                    DatabaseTables.Suppliers,
                    form.getValues(),
                );
            }

            refresh();
            handleClose();

            NotificationsService.success(
                `${isEdit ? "Edit" : "Add"} Supplier`,
                "New supplier has been added successfully!",
            );
        } catch (e: any) {
            NotificationsService.error(
                `${isEdit ? "Edit" : "Add"} Supplier`,
                e.toString(),
            );
        }
    }

    return (
        <Modal
            opened={open}
            onClose={close}
            centered
            title={isEdit ? "Edit Supplier" : "Add Supplier"}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="xs">
                    <TextInput
                        required
                        {...form.getInputProps('name')}
                        label={"Name"}
                        value={form.values.name}
                        onChange={(e) =>
                            form.setValues({
                                name: UtilsService.sanitize(e.target.value),
                            })
                        }
                    />
                    <TextInput
                        required
                        {...form.getInputProps('address')}
                        label={"Address"}
                        value={form.values.address}
                        onChange={(e) =>
                            form.setValues({
                                address: UtilsService.sanitize(e.target.value),
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
