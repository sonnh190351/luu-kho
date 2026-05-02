import { useForm } from "@mantine/form";
import { FormValidationService } from "../../../services/validatior/form-validation.service";
import { useEffect } from "react";
import OperationService from "../../../services/operations/operationService";
import { DatabaseTables } from "../../../enums/tables";
import { NotificationsService } from "../../../services/notifications/notifications.service";
import { Button, Modal, Stack, TextInput } from "@mantine/core";
import UtilsService from "../../../services/utils";

interface ProductModalProps {
    product: any,
    open: boolean,
    close: any
    refresh: any
}

interface ProductModalForm {
    name: string,
}

export default function ProductModal({product, open, close, refresh}: ProductModalProps) {

    const isEdit = Boolean(product);

    const form = useForm<ProductModalForm>({
        initialValues: {
            name: ""
        },
        validate: {
            name: FormValidationService.validateName
        }
    })

    useEffect(() => {
        if(product) {
            form.setValues({
                name: product.name,
            })
        }
    }, [product]);

    async function handleSubmit() {
        try {
            const service = OperationService.getInstance();
            if (isEdit) {
                await service.editItemName(DatabaseTables.Products, {
                    id: product?.id,
                    ...form.getValues(),
                });
            } else {
                await service.addItemWithUniqueName(
                    DatabaseTables.Products,
                    form.getValues(),
                );
            }

            refresh();
            handleClose();
            NotificationsService.success(
                `${isEdit ? "Edit" : "Add"} Dish`,
                `New dish has been ${isEdit ? "edit" : "added"} successfully!`,
            );
        } catch (e: any) {
            NotificationsService.error(
                `${isEdit ? "Edit" : "Add"} Dish`,
                e.toString(),
            );
        }
    }

    function handleClose() {
        form.reset();
        close();
    }

    return (
        <Modal title={isEdit ? "Edit Dish" : "Add Dish"} opened={open} onClose={handleClose} centered={true}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="xs">
                    <TextInput
                        {...form.getInputProps('name')}
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
    )
}