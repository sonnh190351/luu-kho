import {Button, Modal, Select, Stack, TextInput} from "@mantine/core";
import {LocalStorage} from "../../../../enums/localStorage.ts";
import {useForm} from "@mantine/form";
import {FormValidationService} from "../../../../services/validatior/form-validation.service.ts";
import {RequestStatus, CommonRequestType, ManagerRequestType} from "../../../../enums/request.ts";
import {useEffect} from "react";
import UtilsService from "../../../../services/utils.ts";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import RequestService from "../../../../services/operations/request/request.service.ts";

interface RequestModalProps {
    open: boolean;
    refresh: any;
    close: any;
    request?: any;
}

interface RequestFormValues {
    warehouse_id: number;
    description: string;
    type: string;
}

export default function StaffRequestModal({open, close, request}: RequestModalProps) {

    const cachedData = JSON.parse(localStorage.getItem(LocalStorage.userData)!);

    const form = useForm<RequestFormValues>({
        initialValues: {
            description: "",
            warehouse_id: -1,
            type: CommonRequestType.OTHERS,
        },
        validate: {
            description: FormValidationService.validateDescription,
            warehouse_id: (v) => v === -1 ? "Please select a warehouse!" : null,
        },
    });


    useEffect(() => {
        if(request !== undefined) {
            form.setValues({
                description: request.description,
                type: request.description,
                warehouse_id: cachedData.warehouses.id,
            })
        }
    }, [request]);

    async function handleSubmit() {
        try {
            const service = RequestService.getInstance()
            const response = await service.createRequest({
                ...form.getValues(),
                user_id: cachedData.id,
                status: RequestStatus.SUBMITTED
            })
            if(response.error) {
                NotificationsService.error("Add Request", response.error.message)
            } else {
                handleClose()
            }
        } catch (e: any) {
            NotificationsService.error("Add Request", e.toString());
        }
    }

    function handleClose() {
        close()
        setTimeout(() => {
            form.reset()
        }, 200)
    }

    return (
        <Modal opened={open} onClose={handleClose} centered={true} title={"Request"}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="xs">
                    <Select
                        {...form.getInputProps("type")}
                        onChange={(value) => {
                            if(value) {
                                form.setValues({
                                    type: value
                                })
                            }
                        }}
                        required
                        label={"Request Type"}
                        data={
                            Object.entries({
                                ...CommonRequestType,
                                ...ManagerRequestType
                            }).map(([name, type]) => ({label: type, value: name}))
                        }
                    />
                    <TextInput
                        {...form.getInputProps('description')}
                        required
                        label={"Description"}
                        value={form.values.description}
                        onChange={(e) =>
                            form.setValues({
                                description: UtilsService.sanitize(e.target.value),
                            })
                        }
                    />

                    <Button onClick={handleSubmit} type="submit" fullWidth mt="xs">
                        Submit
                    </Button>
                </Stack>
            </form>
        </Modal>
    )
}