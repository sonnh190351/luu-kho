import type { Items } from "../../../../models/items.ts";
import {
    Button,
    Modal,
    MultiSelect,
    NumberInput,
    Select,
    Stack,
    TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import type { Suppliers } from "../../../../models/suppliers.ts";
import type { Categories } from "../../../../models/categories.ts";
import { useForm } from "@mantine/form";
import InventoryService from "../../../../services/operations/inventory.service.ts";
import { DatabaseTables } from "../../../../enums/tables.ts";
import { QUANTITY_TYPES } from "../../../../enums/data.ts";
import type { Tags } from "../../../../models/tags.ts";
import { NotificationsService } from "../../../../services/notifications/notifications.service.ts";
import UtilsService from "../../../../services/utils.ts";
import { FormValidationService } from "../../../../services/validatior/form-validation.service.ts";

interface ItemsModalProps {
    item: Items | null;
    open: boolean;
    refresh: any;
    close: any;
}

interface ItemFormValues {
    category_id: number;
    name: string;
    quantity_type: string;
    supplier_id: number;
    tags: string[];
    warning_limit: number;
}

export default function ItemsModal({
    item,
    open = false,
    close,
    refresh,
}: ItemsModalProps) {
    const isEdit = Boolean(item);

    const [suppliers, setSuppliers] = useState<Suppliers[]>([]);
    const [categories, setCategories] = useState<Categories[]>([]);
    const [tags, setTags] = useState<Tags[]>([]);

    const form = useForm<ItemFormValues>({
        initialValues: {
            category_id: -1,
            name: "",
            quantity_type: "N/A",
            supplier_id: -1,
            tags: [],
            warning_limit: 0,
        },
        validate: {
            name: FormValidationService.validateName,
            quantity_type: FormValidationService.validateQuantityType,
            category_id: FormValidationService.validateCategoryId,
            supplier_id: FormValidationService.validateSupplierId,
        },
    });

    useEffect(() => {
        if (item) {
            form.setValues({
                category_id: item.category_id!,
                name: item.name!,
                quantity_type: item.quantity_type!,
                supplier_id: item.supplier_id!,
                tags: item.tags! ?? [],
                warning_limit: Number(item.warning_limit) ?? 0,
            });
        }
    }, [isEdit]);

    useEffect(() => {
        (async () => await fetchSuppliers())();
        (async () => await fetchCategories())();
        (async () => await fetchTags())();
    }, []);

    async function fetchSuppliers() {
        try {
            const service = InventoryService.getInstance();
            const data = await service.getAllRows(DatabaseTables.Suppliers);
            setSuppliers(data);
        } catch (e: any) {
            NotificationsService.error("Fetch Suppliers", e.toString());
        }
    }

    async function fetchCategories() {
        try {
            const service = InventoryService.getInstance();
            const data = await service.getAllRows(DatabaseTables.Categories);
            setCategories(data);
        } catch (e: any) {
            NotificationsService.error("Fetch Categories", e.toString());
        }
    }

    async function fetchTags() {
        try {
            const service = InventoryService.getInstance();
            const data = await service.getAllRows(DatabaseTables.Tags);
            setTags(data);
        } catch (e: any) {
            NotificationsService.error("Fetch Tags", e.toString());
        }
    }

    async function handleSubmit() {
        try {
            const service = InventoryService.getInstance();
            if (isEdit) {
                await service.editItemName(DatabaseTables.Items, {
                    id: item?.id,
                    ...form.getValues(),
                });
            } else {
                await service.addItemWithUniqueName(
                    DatabaseTables.Items,
                    form.getValues(),
                );
            }

            refresh();
            handleClose();
            NotificationsService.success(
                `${isEdit ? "Edit" : "Add"} Item`,
                `New category has been ${isEdit ? "edit" : "added"} successfully!`,
            );
        } catch (e: any) {
            NotificationsService.error(
                `${isEdit ? "Edit" : "Add"} Item`,
                e.toString(),
            );
        }
    }

    function handleClose() {
        close();
        setTimeout(() => {
            form.reset();
        }, 200);
    }

    return (
        <Modal
            opened={open}
            onClose={handleClose}
            centered
            title={isEdit ? "Edit Item" : "Add Item"}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="xs">
                    <TextInput
                        required
                        label={"Name"}
                        value={form.values.name}
                        onChange={(e) =>
                            form.setValues({
                                name: UtilsService.sanitize(e.target.value),
                            })
                        }
                    />

                    <Select
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

                    <Select
                        value={String(form.values.category_id)}
                        onChange={(value) => {
                            if (value) {
                                form.setValues({
                                    category_id: Number(value),
                                });
                            }
                        }}
                        required
                        searchable
                        label={"Category"}
                        data={categories.map((s) => {
                            return { label: s.name!, value: String(s.id) };
                        })}
                    />

                    <MultiSelect
                        value={form.values.tags}
                        onChange={(value) => {
                            // Sanitize html
                            for (let i = 0; i < value.length; i++) {
                                value[i] = UtilsService.sanitize(value[i]);
                            }

                            form.setValues({
                                tags: value,
                            });
                        }}
                        required
                        searchable
                        label={"Tags"}
                        data={tags.map((s) => {
                            return { label: s.name!, value: String(s.id) };
                        })}
                    />

                    <Select
                        value={form.values.quantity_type}
                        onChange={(value) => {
                            if (value) {
                                form.setValues({
                                    quantity_type: UtilsService.sanitize(value),
                                });
                            }
                        }}
                        required
                        searchable
                        label={"Quantity Type"}
                        data={QUANTITY_TYPES}
                    />

                    <NumberInput
                        required
                        label={"Warning Limit"}
                        value={form.values.name}
                        onChange={(e) => {
                            if (e) {
                                form.setValues({
                                    warning_limit: Number(e),
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
