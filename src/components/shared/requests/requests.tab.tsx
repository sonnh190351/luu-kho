import {
    ActionIcon,
    Button,
    Group,
    Stack,
    Text,
    LoadingOverlay,
    Title, Divider, Badge, Select,
} from "@mantine/core";
import {
    IconEdit, IconFilter,
    IconRefresh,
    IconTrash, IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import type { Requests } from "../../../models/requests.ts";
import CommonTable from "../../dataTable/common.table.tsx";
import OperationService from "../../../services/operations/operationService.ts";
import RequestsModal from "./requests.modal.tsx";
import {
    DatabaseTables,
    DISPLAY_TIME_FORMAT,
} from "../../../enums/tables.ts";
import { NotificationsService } from "../../../services/notifications/notifications.service.ts";
import { InformationService } from "../../../services/notifications/information.service.ts";
import dayjs from "dayjs";
import {BUTTON_COLOR} from "../../../enums/styling.ts";
import UtilsService from "../../../services/utils.ts";
import {CommonRequestType, ManagerRequestType, RequestStatus, StaffRequestType} from "../../../enums/request.ts";
import RequestService from "../../../services/operations/request/request.service.ts";
import {useForm} from "@mantine/form";

interface requestFilterFormType {
    type: string;
    status: RequestStatus | ""
}

export default function RequestsTab() {

    const requestFilterForm = useForm<requestFilterFormType>({
        initialValues: {
            type: "",
            status: "",
        },
    })
    const [isFiltered, setFiltered] = useState<boolean>(false);

    const [isLoading, setLoading] = useState(true);

    const [items, setItems] = useState<any[]>([]);

    const [selectedItem, setSelectedItem] = useState<Requests | null>(null);
    const [openItemModal, setOpenItemModal] = useState<boolean>(false);

    useEffect(() => {
        (async () => await fetchRequests())();
    }, []);

    async function fetchRequests() {
        const service = RequestService.getInstance();

        try {
            const data = await service.getRequestDetails()
            setItems(data);
        } catch (e: any) {
            NotificationsService.error("Fetch requests", e.toString());
        }

        setLoading(false);
    }

    function handleCloseItemModal() {
        setOpenItemModal(false);
        setTimeout(() => {
            setSelectedItem(null);
        }, 200);
    }

    const columns: any[] = [
        {
            accessor: "id",
            title: "ID",
            sortable: true,
            render: ({ id }: Requests) => {
                return (
                    <Group>
                        <Text>{id}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "type",
            title: "Type",
            sortable: true,
            render: ({ type }: Requests) => {
                return <Group>{type}</Group>;
            },
        },
        {
            accessor: "description",
            title: "Description",
            sortable: true,
            render: ({ description }: Requests) => {
                return <Group>{description}</Group>;
            },
        },
        {
            width: 140,
            accessor: "status",
            title: "Status",
            sortable: true,
            render: ({ status }: Requests) => {
                return <Group>
                    <Badge color={UtilsService.getRequestBadgeColor(status as RequestStatus)}>{status}</Badge>
                </Group>;
            },
        },
        {
            accessor: "requester",
            title: "Requester",
            sortable: true,
            render: ({ requester }: any) => {
                return <Group>{requester.last_name} {requester.first_name} ({requester.email})</Group>;
            },
        },
        {
            accessor: "handler",
            title: "Handler",
            sortable: true,
            render: ({ handler }: any) => {
                return <Group>{handler ? handler.email : <Text style={{
                    color: '#fa5252'
                }}>Not yet handled</Text>}</Group>;
            },
        },
        {
            accessor: "remark",
            title: "Remark",
            sortable: true,
            render: ({ remark }: any) => {
                return <Group>{remark ?? "N/A"}</Group>;
            },
        },
        {
            accessor: "created_at",
            title: "Created At",
            width: 250,
            sortable: true,
            render: ({ created_at }: Requests) => {
                return (
                    <Group>
                        {dayjs(created_at).format(DISPLAY_TIME_FORMAT)}
                    </Group>
                );
            },
        },
        {
            accessor: "updated_at",
            title: "Last Updated At",
            width: 250,
            sortable: true,
            render: ({ updated_at }: Requests) => {
                return (
                    <Group>
                        {dayjs(updated_at).format(DISPLAY_TIME_FORMAT)}
                    </Group>
                );
            },
        },
        {
            accessor: "actions",
            title: "Actions",
            width: 120,
            render: ({ id }: Requests) => {
                return (
                    <Group>
                        <ActionIcon
                            color={BUTTON_COLOR.PRIMARY}
                            onClick={() => handleDelete(id)}
                            size={"lg"}>
                            <IconTrash />
                        </ActionIcon>
                        <ActionIcon
                            color={BUTTON_COLOR.PRIMARY}
                            size={"lg"} onClick={() => handleEdit(id)}>
                            <IconEdit />
                        </ActionIcon>
                    </Group>
                );
            },
        },
    ];

    function handleDelete(id: number) {
        InformationService.getInstance().confirm(async () => {
            try {
                const service = OperationService.getInstance();
                const result = await service.deleteById(DatabaseTables.Requests, id);
                if(result.length > 0) {
                    NotificationsService.error("Delete Result", result)
                } else {
                    NotificationsService.success(
                        "Delete Result",
                        "Deleted successfully!",
                    );
                }
            } catch (e: any) {
                NotificationsService.error("Delete Request", e.toString());
            }
            await fetchRequests();
        });
    }

    function handleEdit(id: number) {
        const matching = items.find((i) => i.id === id);
        if (matching) {
            setSelectedItem(matching);
            setOpenItemModal(true);
        }
    }

    function handleFilter() {
        const {type, status} = requestFilterForm.getValues()
        if (!type && !status) {
            return
        }

        setFiltered(true)
        const temp = sessionStorage.getItem(DatabaseTables.Requests);
        let cache
        if (!temp) {
            sessionStorage.setItem(DatabaseTables.Requests, JSON.stringify(items));
            cache = JSON.parse(JSON.stringify(items));
        } else {
            cache = JSON.parse(temp);
        }

        if (status) {
            console.log(status)
            cache = cache.filter((i: any) => i.status === status);
        }

        if (type) {
            cache = cache.filter((i: any) => i.type === type);
        }

        setItems(cache)
    }

    async function handleClearFilter() {
        setFiltered(false)
        requestFilterForm.reset()
        await fetchRequests()
    }

    return (
        <>
            <Stack pt={"lg"} pl={"sm"}>
                <LoadingOverlay
                    visible={isLoading}
                    overlayProps={{ radius: "sm", blur: 2 }}
                />

                <Stack gap={0}>
                    <Text>Management</Text>
                    <Title>Requests Data</Title>
                </Stack>
                <Divider/>

                <Group justify={"space-between"}>
                    <Stack gap={5}>
                        <Text>Filter</Text>
                        <Group>
                            <Select
                                placeholder={"Request Type"}
                                allowDeselect={true} clearable={true}
                                data={[...Object.keys(ManagerRequestType), ...Object.keys(StaffRequestType), ...Object.keys(CommonRequestType)]}
                                key={requestFilterForm.key("type")}
                                { ...requestFilterForm.getInputProps("type")}
                            />
                            <Select
                                placeholder={"Status"}
                                allowDeselect={true} clearable={true}
                                data={Object.values(RequestStatus)}
                                key={requestFilterForm.key("status")}
                                { ...requestFilterForm.getInputProps("status")}
                            />
                            <ActionIcon onClick={handleFilter} color={BUTTON_COLOR.PRIMARY} variant={'outline'}
                                        size={"lg"}>
                                <IconFilter/>
                            </ActionIcon>
                            {
                                isFiltered && <ActionIcon size={"lg"} onClick={handleClearFilter} color={"red"}>
                                    <IconX/>
                                </ActionIcon>
                            }
                        </Group>
                    </Stack>
                    <Stack gap={5}>
                        <Text>Controls</Text>
                        <Group>
                            <Button
                                color={BUTTON_COLOR.PRIMARY}
                                onClick={fetchRequests}
                                leftSection={<IconRefresh />}>
                                Refresh
                            </Button>
                        </Group>
                    </Stack>
                </Group>

                <CommonTable data={items} columns={columns} />
            </Stack>

            {/*Item modal*/}
            <RequestsModal
                request={selectedItem}
                open={openItemModal}
                refresh={fetchRequests}
                close={handleCloseItemModal}
            />
        </>
    );
}
