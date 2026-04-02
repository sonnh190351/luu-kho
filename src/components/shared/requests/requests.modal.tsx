import {Button, Modal, Select, Text, Stack, Group, TextInput, Divider} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useEffect} from "react";
import {RequestStatus} from "../../../enums/request.ts";
import {NotificationsService} from "../../../services/notifications/notifications.service.ts";
import {LocalStorage} from "../../../enums/localStorage.ts";
import RequestService from "../../../services/operations/request/request.service.ts";

interface RequestsModalProps {
    request: any;
    open: boolean;
    refresh: any;
    close: any;
}

interface RequestsFormValues {
    status?: string;
    remark: string
}

export default function RequestsModal({
                                          request,
                                          open = false,
                                          close,
                                          refresh,
                                      }: RequestsModalProps) {
    const isEdit = request !== null;

    const cachedData = JSON.parse(localStorage.getItem(LocalStorage.userData)!);

    const form = useForm<RequestsFormValues>({
        initialValues: {
            status: "",
            remark: "",
        },
        validate: {},
    });

    useEffect(() => {
        if (request) {
            form.setValues({
                status: request.status!,
                remark: request.remark!,
            })
        }
    }, [request]);

    async function handleSubmit() {
        try {
            const service = RequestService.getInstance();
            const response = await service.updateRequest({
                id: request.id,
                ...form.getValues(),
                handler_id: cachedData.id
            })

            if(response.error) {
                NotificationsService.error("Add Request", response.error.message)
            } else {
                close()
                refresh();
            }
        } catch (e: any) {
            NotificationsService.error("Update request status", e.toString());
        }
    }

    return (
        <Modal
            opened={open}
            onClose={close}
            centered
            title={isEdit ? "Edit Request" : "Add Request"}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="5">
                    <Group>
                        <Text>Request Type:</Text>
                        <Text>{request?.type}</Text>
                    </Group>
                    <Group>
                        <Text>Description:</Text>
                        <Text>{request?.description}</Text>
                    </Group>
                    <Group>
                        <Text>Requester:</Text>
                        <Text>{request?.requester.last_name} {request?.requester.first_name} ({request?.requester.email})</Text>
                    </Group>
                    <Divider mt={'md'} mb={'md'} />
                    <Select
                        required={true}
                        label={"Status"}
                        {...form.getInputProps('status')}
                        data={Object.values(RequestStatus)}
                    />
                    <TextInput
                        placeholder={"(Optional) Please add remark here."}
                        label={"Remark"}
                        {...form.getInputProps('remark')}
                    />
                    <Button type="submit" fullWidth mt="md">
                        Submit
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
}
