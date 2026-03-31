import {
    Badge,
    Button, Divider,
    Group,
    LoadingOverlay,
    Select,
    Stack,
    Text,
    Title
} from "@mantine/core";
import {useEffect, useState} from "react";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import OperationService from "../../../../services/operations/operationService.ts";
import {LocalStorage} from "../../../../enums/localStorage.ts";
import CommonTable from "../../../../components/dataTable/common.table.tsx";
import type {DataTableColumn} from "mantine-datatable";
import {IconEdit, IconPlus, IconRefresh} from "@tabler/icons-react";
import UtilsService from "../../../../services/utils.ts";
import OrderModal from "./orders.modal.tsx";
import {BUTTON_COLOR} from "../../../../enums/styling.ts";
import dayjs from "dayjs";
import {DISPLAY_TIME_FORMAT} from "../../../../enums/tables.ts";

export default function OrdersTabs() {

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [orders, setOrders] = useState<any[]>([]);

    const [openModal, setOpenModal] = useState<boolean>(false);

    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    const cachedData = localStorage.getItem(LocalStorage.userData);

    const isLoggedIn = Boolean(cachedData);

    if (!isLoggedIn) {
        window.location.href = "/login";
        return;
    }

    const cached = JSON.parse(cachedData!)

    const columns: DataTableColumn[] = [
        {
            accessor: "id",
            title: "ID",
            width: 120,
            sortable: true,
            render: ({id}: any) => {
                return (
                    <Group>
                        <Text>{id}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "products",
            title: "Product",
            sortable: true,
            render: ({products}: any) => {
                return (
                    <Group>
                        <Text>{products.name}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "users",
            title: "User",
            sortable: true,
            render: ({users}: any) => {
                return (
                    <Group>
                        <Text>{users.last_name} {users.first_name} ({users.email})</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "quantity",
            title: "Quantity",
            sortable: true,
            render: ({quantity}: any) => {
                return (
                    <Group>
                        <Text>{quantity}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "created_at",
            title: "Created At",
            width: 250,
            sortable: true,
            render: ({created_at}: any) => {
                return (
                    <Group>
                        {dayjs(created_at).format(DISPLAY_TIME_FORMAT)}
                    </Group>
                );
            },
        },
        {
            accessor: "status",
            title: "Status",
            sortable: true,
            width: 200,
            render: ({status}: any) => {
                return (
                    <Group>
                        <Badge color={UtilsService.getOrderBadgeColor(status)}>{status}</Badge>
                    </Group>
                );
            },
        },
        {
            accessor: "actions",
            title: "Actions",
            sortable: false,
            width: 160,
            render: (order: any) => {
                return (
                    <Group>
                        <Button color={BUTTON_COLOR.PRIMARY} onClick={() => {
                            setSelectedOrder(order)
                            setOpenModal(true)
                        }} leftSection={<IconEdit/>}>Update</Button>
                    </Group>
                );
            },
        },
    ]

    useEffect(() => {
        (async () => await fetchOrders())();
    }, []);

    async function fetchOrders() {
        setIsLoading(true);

        try {
            const service = OperationService.getInstance()
            if (cached.warehouses.id) {
                const data = await service.getWarehouseOrders(cached.warehouses.id)
                setOrders(data as any[])
            }
        } catch (e: any) {
            NotificationsService.error("Fetch orders", e.toString())
        }

        setIsLoading(false);
    }

    function handleCloseModal() {
        setOpenModal(false)
        setTimeout(() => {
            setSelectedOrder(null)
        }, 200)
    }

    return (
        <>
            <Stack pt={"lg"} pl={"sm"}>
                <LoadingOverlay
                    visible={isLoading}
                    overlayProps={{radius: "sm", blur: 2}}
                />
                <LoadingOverlay/>

                <Stack gap={0}>
                    <Text>Management</Text>
                    <Title>Orders Data</Title>
                </Stack>
                <Divider/>
                <Group justify={"space-between"}>
                    <Stack gap={5}>
                        <Text>Filter</Text>
                        <Group gap={10}>
                            <Select placeholder={"Status"} />
                        </Group>
                    </Stack>
                    <Stack gap={5}>
                        <Text>Controls</Text>
                        <Group>
                            <Button
                                color={BUTTON_COLOR.PRIMARY}
                                onClick={() => {
                                    setOpenModal(true)
                                }}
                                leftSection={<IconPlus/>}>
                                Add
                            </Button>
                            <Button
                                color={BUTTON_COLOR.PRIMARY}
                                onClick={() => fetchOrders()}
                                leftSection={<IconRefresh/>}>
                                Refresh
                            </Button>
                        </Group>
                    </Stack>
                </Group>
                <CommonTable data={orders} columns={columns}/>
            </Stack>

            <OrderModal order={selectedOrder} open={openModal} close={handleCloseModal} refresh={fetchOrders} />
        </>
    )
}