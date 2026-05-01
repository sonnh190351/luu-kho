import {
    Badge,
    Button, Divider,
    Group,
    LoadingOverlay,
    Select,
    Stack,
    TextInput,
    ActionIcon,
    Text,
    Title
} from "@mantine/core";
import {useEffect, useState} from "react";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import OperationService from "../../../../services/operations/operationService.ts";
import {LocalStorage} from "../../../../enums/localStorage.ts";
import CommonTable from "../../../../components/dataTable/common.table.tsx";
import type {DataTableColumn} from "mantine-datatable";
import {IconEdit, IconPlus, IconRefresh, IconX, IconFilter} from "@tabler/icons-react";
import UtilsService from "../../../../services/utils.ts";
import OrderModal from "./orders.modal.tsx";
import {BUTTON_COLOR} from "../../../../enums/styling.ts";
import dayjs from "dayjs";
import {DISPLAY_TIME_FORMAT} from "../../../../enums/tables.ts";
import {useForm} from "@mantine/form";
import {OrderStatus} from "../../../../enums/orders.ts";
import {DatabaseTables} from "../../../../enums/tables.ts";

interface FilterFormType {
    product: string;
    user: string;
    status?: OrderStatus | null
}


export default function OrdersTabs() {

    const filterForm = useForm<FilterFormType>({
        initialValues: {
            product: "",
            user: "",
            status: null
        }
    })

    const [isFiltered, setFiltered] = useState<boolean>(false)

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
                <CommonTable data={orders} columns={columns}/>
            </Stack>

            <OrderModal order={selectedOrder} open={openModal} close={handleCloseModal} refresh={fetchOrders} />
        </>
    )
}