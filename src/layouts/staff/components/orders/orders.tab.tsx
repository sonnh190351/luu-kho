import {
    Badge,
    Button,
    Card,
    Grid,
    Group,
    LoadingOverlay,
    type MantineStyleProp, Select,
    Stack,
    Text,
    Title
} from "@mantine/core";
import {useEffect, useState} from "react";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import InventoryService from "../../../../services/operations/inventory.service.ts";
import {LocalStorage} from "../../../../enums/localStorage.ts";
import CommonTable from "../../../../components/dataTable/common.table.tsx";
import type {DataTableColumn} from "mantine-datatable";
import {IconEdit, IconPlus, IconRefresh} from "@tabler/icons-react";
import {OrderStatus} from "../../../../enums/orders.ts";
import StaffOrderModal from "./order.modal.tsx";
import UtilsService from "../../../../services/utils.ts";

const cardStyle: MantineStyleProp = {
    height: '150px',
    position: 'relative',
}

interface OrderStatistics {
    total: number;
    received: number;
    processing: number;
    finished: number;
    cancelled: number;
}

export default function StaffOrdersLayout() {

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [statistics, setStatistics] = useState<OrderStatistics>({
        total: 0,
        received: 0,
        processing: 0,
        finished: 0,
        cancelled: 0,
    })

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
            accessor: "id",
            title: "Actions",
            sortable: false,
            width: 160,
            render: (order: any) => {
                return (
                    <Group>
                        <Button onClick={() => {
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
            const service = InventoryService.getInstance()
            if (cached.warehouses.id) {
                const data = await service.getWarehouseOrders(cached.warehouses.id)
                setOrders(data as any[])

                updateStatistics(data)
            }
        } catch (e: any) {
            NotificationsService.error("Fetch orders", e.toString())
        }

        setIsLoading(false);
    }

    function updateStatistics(data: any[]) {
        let received = 0
        let processing = 0
        let finished = 0
        let cancelled = 0

        for(let i = 0; i < data.length; i++) {
            switch (data[i].status) {
                case OrderStatus.RECEIVED:
                    received += 1
                    break
                case OrderStatus.PROCESSING:
                    processing += 1
                    break
                case OrderStatus.FINISHED:
                    finished += 1
                    break
                case OrderStatus.CANCELLED:
                    cancelled += 1
                    break
                default:
                    break
            }
        }

        setStatistics({
            total: data.length,
            received: received,
            processing: processing,
            finished: finished,
            cancelled: cancelled,
        })
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

                <Title>Orders Management</Title>

                <Grid>
                    <Grid.Col span={4}>
                        <Card style={{
                            ...cardStyle
                        }}>
                            <Stack gap={5} justify={'flex-end'} align={'start'}>
                                <Text>Total Orders</Text>
                                <Title>{statistics.total}</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={2}>
                        <Card style={{
                            ...cardStyle
                        }}>
                            <Stack gap={5} justify={'flex-end'} align={'start'}>
                                <Text>Received orders</Text>
                                <Title>{statistics.received}</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={2}>
                        <Card style={{
                            ...cardStyle
                        }}>
                            <Stack gap={5} justify={'flex-end'} align={'start'}>
                                <Text>Processing orders</Text>
                                <Title>{statistics.processing}</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={2}>
                        <Card style={{
                            ...cardStyle
                        }}>
                            <Stack gap={5} justify={'flex-end'} align={'start'}>
                                <Text>Finished orders</Text>
                                <Title>{statistics.finished}</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={2}>
                        <Card style={{
                            ...cardStyle
                        }}>
                            <Stack gap={5} justify={'flex-end'} align={'start'}>
                                <Text>Canceled orders</Text>
                                <Title>{statistics.cancelled}</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                </Grid>
                <Group justify={"space-between"}>
                    <Stack gap={5}>
                        <Text>Filter</Text>
                        <Group gap={10}>
                            <Text style={{
                                fontWeight: "bold"
                            }}>Status:</Text>
                            <Select/>
                        </Group>
                    </Stack>
                    <Stack gap={5}>
                        <Text>Controls</Text>
                        <Group>
                            <Button
                                onClick={() => {
                                    setOpenModal(true)
                                }}
                                leftSection={<IconPlus/>}>
                                Add
                            </Button>
                            <Button
                                onClick={() => fetchOrders()}
                                leftSection={<IconRefresh/>}>
                                Refresh
                            </Button>
                        </Group>
                    </Stack>
                </Group>
                <CommonTable height={'55dvh'} data={orders} columns={columns}/>
            </Stack>

            <StaffOrderModal order={selectedOrder} open={openModal} close={handleCloseModal} refresh={fetchOrders} />
        </>
    )
}