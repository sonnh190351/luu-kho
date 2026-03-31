import {
    Badge,
    Button,
    Card,
    Divider,
    Grid,
    Group,
    LoadingOverlay,
    type MantineStyleProp,
    Select,
    Stack,
    Text,
    TextInput,
    Title
} from "@mantine/core";
import {LocalStorage} from "../../../../enums/localStorage.ts";
import {useEffect, useState} from "react";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import {IconPlus, IconRefresh, IconSearch} from "@tabler/icons-react";
import WarehouseItemModal from "./warehouseItem.modal.tsx";
import dayjs from "dayjs";
import {DISPLAY_DATE_FORMAT} from "../../../../enums/tables.ts";
import ExportInventoryModal from "../../../../components/modals/export.modal.tsx";
import CommonTable from "../../../../components/dataTable/common.table.tsx";
import type {Inventories} from "../../../../models/inventories.ts";
import {ExpiringStatus} from "../../../../enums/data.ts";
import UtilsService from "../../../../services/utils.ts";
import OperationService from "../../../../services/operations/operationService.ts";

const cardStyle: MantineStyleProp = {
    height: '150px',
    position: 'relative',
}

interface InventoryStatistics {
    total: number;
    expired: number;
    expiring: number;
    outOfStock: number;
}

export default function StaffWarehousesTab() {
    const ONE_DAY_MS = 86400000

    const cachedData = localStorage.getItem(LocalStorage.userData);

    const loginData = JSON.parse(cachedData!);

    const warehouse_id = loginData.warehouses.id;

    const [items, setItems] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    const [openModal, setOpenModal] = useState(false);

    const [openExportModal, setOpenExportModal] = useState(false);

    const [selectedItem, setSelectedItem] = useState<any>(null);

    const [statistics, setStatistics] = useState<InventoryStatistics>({
        total: 0,
        expired: 0,
        expiring: 0,
        outOfStock: 0,
    });

    useEffect(() => {
        (async () => await fetchItems())();
    }, []);

    async function fetchItems() {
        setIsLoading(true)
        try {
            if(warehouse_id !== null) {
                const service = OperationService.getInstance();
                const data = await service.getWarehouseInventoryItems(warehouse_id)
                setItems(data);
                updateStatistics(data)
            }
        } catch (e: any) {
            NotificationsService.error("Fetch Items", e.toString());
        }
        setIsLoading(false)
    }

    function updateStatistics(data: any[]) {
        const total = data.length;
        const expired = data.filter((item) => (new Date(item.expired_at).getTime() - new Date().getTime()) <= 0);
        const expiring = data.filter((item) => {
            const time = new Date(item.expired_at).getTime() - new Date().getTime()
                return time <= ONE_DAY_MS && time > 0
        })
        const outOfStock = data.filter((item) => item.quantity <= 0)

        setStatistics({
            total: total,
            expired: expired.length,
            expiring: expiring.length,
            outOfStock: outOfStock.length,
        })
    }

    function handleCloseModal() {
        setOpenModal(false);
        setTimeout(() => {
            setSelectedItem(null);
        }, 200)
    }

    function handleCloseExportModal() {
        setOpenExportModal(false);
        setTimeout(() => {
            setSelectedItem(null);
        }, 200)
    }

    const columns: any[] = [
        {
            accessor: "id",
            title: "ID",
            width: 70,
            sortable: true,
            render: ({id}: Inventories) => {
                return (
                    <Group>
                        <Text>{id}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "items",
            title: "Items",
            sortable: false,
            width: 350,
            render: ({items}: Inventories) => {
                return (
                    <Group>
                        <Text>{items.name}</Text>
                    </Group>
                );
            },
        },

        {
            accessor: "quantity",
            title: "Quantity",
            sortable: true,
            width: true,
            render: ({quantity, items}: Inventories) => {
                return (
                    <Group gap={5}>
                        <Text>{quantity}</Text>
                        <Text>({items.quantity_type})</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "created_at",
            title: "Added Date",
            sortable: true,
            render: ({created_at}: Inventories) => {
                return (
                    <Group>
                        {dayjs(created_at).format(DISPLAY_DATE_FORMAT)}
                    </Group>
                );
            },
        },
        {
            accessor: "expired_at",
            title: "Expired At",
            sortable: true,
            render: ({expired_at}: Inventories) => {
                return (
                    <Group>
                        {dayjs(expired_at).format(DISPLAY_DATE_FORMAT)}
                    </Group>
                );
            },
        },
        {
            accessor: "expired_at",
            title: "Status",
            sortable: true,
            render: ({ expired_at }: Inventories) => {
                const time = new Date(expired_at!).getTime() - new Date().getTime()
                const status = time < 0 ? ExpiringStatus.EXPIRED : time <= ONE_DAY_MS ? ExpiringStatus.EXPIRING_SOON : ExpiringStatus.FRESH
                return (
                    <Group>
                        <Badge color={UtilsService.getExpireBadgeColor(status)}>
                            {status}
                        </Badge>
                    </Group>
                );
            },
        },
        {
            accessor: "actions",
            title: "Actions",
            sortable: false,
            width: 80,
            render: ({id}: Inventories) => {
                return (
                    <Group>
                        {
                            id
                        }
                    </Group>
                );
            },
        },
    ];

    return (
        <>
            <Stack pt={"lg"} pl={"sm"}>
                <LoadingOverlay
                    visible={isLoading}
                    overlayProps={{radius: "sm", blur: 2}}
                />
                <Stack gap={0}>
                    <Text>Management</Text>
                    <Title>Warehouse Inventory</Title>
                </Stack>
                <Divider/>
                <Grid>
                    <Grid.Col span={3}>
                        <Card style={{
                            ...cardStyle
                        }}>
                            <Stack justify={'flex-end'} align={'start'}>
                                <Text>Total Items</Text>
                                <Title>{statistics.total}</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <Card style={{
                            ...cardStyle
                        }}>
                            <Stack justify={'flex-end'} align={'start'}>
                                <Text>Expired</Text>
                                <Title>{statistics.expired}</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <Card style={{
                            ...cardStyle
                        }}>
                            <Stack justify={'flex-end'} align={'start'}>
                                <Text>Expires in 1 day</Text>
                                <Title>{statistics.expiring}</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <Card style={{
                            ...cardStyle
                        }}>
                            <Stack justify={'flex-end'} align={'start'}>
                                <Text>Out of stock</Text>
                                <Title>{statistics.outOfStock}</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                </Grid>
                <Group justify={'space-between'}>
                    <Group>
                        <TextInput label={"Name"} leftSection={<IconSearch />} />
                        <Select label={"Warehouse"}></Select>
                        <Select label={"Category"}></Select>
                        <Select label={"Status"}></Select>
                    </Group>
                    <Stack gap={2}>
                        <Text style={{
                            fontSize: 14
                        }}>Controls</Text>
                        <Group>
                            <Button
                                onClick={() => setOpenModal(true)}
                                leftSection={<IconPlus/>}>
                                Add
                            </Button>
                            <Button
                                onClick={() => fetchItems()}
                                leftSection={<IconRefresh/>}>
                                Refresh
                            </Button>
                        </Group>
                    </Stack>
                </Group>
                <Divider />
                <CommonTable height={'51vh'} data={items} columns={columns} />
            </Stack>

            <WarehouseItemModal open={openModal} close={handleCloseModal} refresh={fetchItems} />

            <ExportInventoryModal open={openExportModal} refresh={fetchItems} close={handleCloseExportModal} />
        </>
    )
}