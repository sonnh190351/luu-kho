import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import type { Tags } from "../../../../models/tags.ts";
import InventoryService from "../../../../services/operations/inventory.service.ts";
import { NotificationsService } from "../../../../services/notifications/notifications.service.ts";
import { useEffect } from "react";
import { DatabaseTables } from "../../../../enums/tables.ts";
import UtilsService from "../../../../services/utils.ts";
import { FormValidationService } from "../../../../services/validatior/form-validation.service.ts";

interface TagsModalProps {
    tag: Tags | null;
    open: boolean;
    refresh: any;
    close: any;
}

interface TagsFormValues {
    name: string;
}

export default function TagsModal({
    tag,
    open = false,
    close,
    refresh,
}: TagsModalProps) {
    const isEdit = Boolean(tag);

    const form = useForm<TagsFormValues>({
        initialValues: {
            name: "",
        },
        validate: {
            name: FormValidationService.validateName,
        },
    });

    useEffect(() => {
        if (tag) {
            form.setValues({
                name: tag.name!,
            });
        }
    }, [isEdit]);

    async function handleSubmit() {
        try {
            const service = InventoryService.getInstance();

            if (isEdit) {
                await service.editItemName(DatabaseTables.Tags, {
                    id: tag?.id,
                    ...form.getValues(),
                });
            } else {
                await service.addItemWithUniqueName(
                    DatabaseTables.Tags,
                    form.getValues(),
                );
            }
            refresh();
            handleClose();
            NotificationsService.success(
                "Add Tag",
                "New tag has been added successfully!",
            );
        } catch (e: any) {
            NotificationsService.error("Add Tag", e.toString());
        }
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
            title={isEdit ? "Edit Tag" : "Add Tag"}>
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
                    <Button type="submit" fullWidth mt="md">
                        Submit
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
}
