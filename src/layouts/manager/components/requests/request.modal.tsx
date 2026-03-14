import {Button, Modal, Select, Stack, TextInput} from "@mantine/core";
import {LocalStorage} from "../../../../enums/localStorage.ts";
import {useForm} from "@mantine/form";
import {FormValidationService} from "../../../../services/validatior/form-validation.service.ts";
import {RequestStatus, RequestType} from "../../../../enums/request.ts";
import {useEffect, useState} from "react";
import UtilsService from "../../../../services/utils.ts";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import DatabaseService from "../../../../services/database/database.service.ts";
import {DatabaseTables} from "../../../../enums/tables.ts";
import InventoryService from "../../../../services/operations/inventory.service.ts";
import type {Warehouses} from "../../../../models/warehouses.ts";

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

export default function ManagerRequestModal({open, close, request}: RequestModalProps) {

    const cachedData = JSON.parse(localStorage.getItem(LocalStorage.userData)!);

    const [warehouses, setWarehouses] = useState<Warehouses[]>([]);

    const form = useForm<RequestFormValues>({
        initialValues: {
            description: "",
            warehouse_id: -1,
            type: RequestType.OTHERS,
        },
        validate: {
            description: FormValidationService.validateDescription,
            warehouse_id: (v) => v === -1 ? "Please select a warehouse!" : null,
        },
    });

    useEffect(() => {
        (async () => await fetchWarehouses())();
    }, []);

    useEffect(() => {
        if(request !== undefined) {
            form.setValues({
                description: request.description,
                type: request.description,
                warehouse_id: request.warehouse_id,
            })
        }
    }, [request]);

    async function fetchWarehouses() {
        const service = InventoryService.getInstance();
        const data = await service.getAllRows(DatabaseTables.Warehouses);
        setWarehouses(data);
    }

    async function handleSubmit() {
        try {
            const service = DatabaseService.getInstance();
            const response = await service.add(DatabaseTables.Requests, {
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
                            Object.entries(RequestType).map(([name, type]) => ({label: type, value: name}))
                        }
                    />
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