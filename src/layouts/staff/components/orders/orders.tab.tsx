import {
    ActionIcon,
    Badge,
    Button,
    Card, Divider,
    Grid,
    Group,
    LoadingOverlay,
    type MantineStyleProp, Select,
    Stack,
    Text, TextInput,
    Title
} from "@mantine/core";
import {useEffect, useState} from "react";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import OperationService from "../../../../services/operations/operationService.ts";
import {LocalStorage} from "../../../../enums/localStorage.ts";
import CommonTable from "../../../../components/dataTable/common.table.tsx";
import type {DataTableColumn} from "mantine-datatable";
import {IconEdit, IconFilter, IconPlus, IconRefresh, IconX} from "@tabler/icons-react";
import {OrderStatus} from "../../../../enums/orders.ts";
import StaffOrderModal from "./order.modal.tsx";
import UtilsService from "../../../../services/utils.ts";
import {BUTTON_COLOR} from "../../../../enums/styling.ts";
import {useForm} from "@mantine/form";
import {DatabaseTables} from "../../../../enums/tables.ts";

const cardStyle: MantineStyleProp = {
    height: '150px',
    position: 'relative',
}

interface OrderStatistics {
    total: number;
    received: number;
    processing: number;
    finished: number;
}

interface FilterFormType {
    product: string;
    user: string;
    status?: OrderStatus | null
}

export default function StaffOrdersLayout() {

    const filterForm = useForm<FilterFormType>({
        initialValues: {
            product: "",
            user: "",
            status: null
        }
    })

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [statistics, setStatistics] = useState<OrderStatistics>({
        total: 0,
        received: 0,
        processing: 0,
        finished: 0,
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

    const [isFiltered, setFiltered] = useState<boolean>(false);

    const cached = JSON.parse(cachedData!)

    const columns: DataTableColumn[] = [
        {
            accessor: "id",
            title: "ID",
            width: 80,
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
            title: "Dish",
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
                        <Text>{quantity.toLocaleString("en-US")}</Text>
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
            accessor: "remark",
            title: "Remark",
            sortable: true,
            width: 400,
            render: ({remark}: any) => {
                return (
                    <Group>
                        <Text>{remark}</Text>
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
                        <Button disabled={order.status === OrderStatus.FINISHED} onClick={() => {
                            setSelectedOrder(order)
                            setOpenModal(true)
                        }} color={BUTTON_COLOR.PRIMARY} leftSection={<IconEdit/>}>Update</Button>
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

        for (let i = 0; i < data.length; i++) {
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
                default:
                    break
            }
        }

        setStatistics({
            total: data.length,
            received: received,
            processing: processing,
            finished: finished,
        })
    }

    function handleCloseModal() {
        setOpenModal(false)
        setTimeout(() => {
            setSelectedOrder(null)
        }, 200)
    }

    function handleFilter() {
        const {user, product, status} = filterForm.getValues()
        if(user.length === 0 && product.length === 0 && !status) {
            return
        }

        setFiltered(true)
        const temp = sessionStorage.getItem(DatabaseTables.Orders);
        let cache
        if (!temp) {
            sessionStorage.setItem(DatabaseTables.Orders, JSON.stringify(orders));
            cache = JSON.parse(JSON.stringify(orders));
        } else {
            cache = JSON.parse(temp);
        }

        if (user.length > 0) {
            cache = cache.filter((i: any) => [i.users.last_name, i.users.first_name].join(" ").startsWith(user));
        }

        if (status) {
            cache = cache.filter((i: any) => i.status === status);
        }

        if (product.length > 0) {
            cache = cache.filter((i: any) => i.products.name.startsWith(product));
        }

        setOrders(cache)
    }

    async function handleClearFilter() {
        setFiltered(false)
        filterForm.reset()
        await fetchOrders()
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

                <Grid>
                    <Grid.Col span={3}>
                        <Card style={{
                            ...cardStyle
                        }}>
                            <Stack gap={5} justify={'flex-end'} align={'start'}>
                                <Text>Total Orders</Text>
                                <Title>{statistics.total}</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <Card style={{
                            ...cardStyle
                        }}>
                            <Stack gap={5} justify={'flex-end'} align={'start'}>
                                <Text>Received orders</Text>
                                <Title>{statistics.received}</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <Card style={{
                            ...cardStyle
                        }}>
                            <Stack gap={5} justify={'flex-end'} align={'start'}>
                                <Text>Processing orders</Text>
                                <Title>{statistics.processing}</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <Card style={{
                            ...cardStyle
                        }}>
                            <Stack gap={5} justify={'flex-end'} align={'start'}>
                                <Text>Finished orders</Text>
                                <Title>{statistics.finished}</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                </Grid>
                <Group justify={"space-between"}>
                    <Stack gap={5}>
                        <Text>Filter</Text>
                        <Group gap={10}>
                            <Select data={Object.values(OrderStatus).map((v) => {
                                return {
                                    label: v,
                                    value: v
                                }
                            })} allowDeselect={true} clearable={true} {...filterForm.getInputProps("status")}
                                    style={{width: 200}}
                                    placeholder={"Status"}/>
                            <TextInput {...filterForm.getInputProps("product")} style={{width: 200}}
                                       placeholder={"Dish"}/>
                            <TextInput {...filterForm.getInputProps("user")} style={{width: 200}} placeholder={"User"}/>
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
                <CommonTable height={'50dvh'} data={orders} columns={columns}/>
            </Stack>

            <StaffOrderModal order={selectedOrder} open={openModal} close={handleCloseModal} refresh={fetchOrders}/>
        </>
    )
}