import {
    Badge,
    Button,
    Card,
    Divider,
    Grid,
    Group,
    LoadingOverlay,
    type MantineStyleProp,
    Stack,
    Text,
    TextInput,
    Title
} from "@mantine/core";
import {LocalStorage} from "../../../../enums/localStorage.ts";
import {useEffect, useState} from "react";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import { IconRefresh, IconSearch} from "@tabler/icons-react";
import WarehouseItemModal from "./warehouseItem.modal.tsx";
import dayjs from "dayjs";
import {DatabaseTables, DISPLAY_DATE_FORMAT, DISPLAY_TIME_FORMAT} from "../../../../enums/tables.ts";
import ExportInventoryModal from "../../../../components/modals/export.modal.tsx";
import CommonTable from "../../../../components/dataTable/common.table.tsx";
import type {Inventories} from "../../../../models/inventories.ts";
import {ExpiringStatus} from "../../../../enums/data.ts";
import UtilsService from "../../../../services/utils.ts";
import OperationService from "../../../../services/operations/operationService.ts";
import {BUTTON_COLOR} from "../../../../enums/styling.ts";
import type {DataTableRowExpansionProps} from "mantine-datatable";

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

    const [keyword, setKeyword] = useState<string>("");

    const ONE_DAY_MS = 86400000

    const cachedData = localStorage.getItem(LocalStorage.userData);

    const loginData = JSON.parse(cachedData!);

    const warehouse_id = loginData.warehouses.id;

    const [items, setItems] = useState<any[]>([]);
    const [rootData, setRootData] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    const [openModal, setOpenModal] = useState(false);

    const [openExportModal, setOpenExportModal] = useState(false);

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
                const data = await service.getWarehouseInventoriesImportItems(warehouse_id)
                mappingData(data);
                setRootData(data)
                updateStatistics(data)
            }
        } catch (e: any) {
            NotificationsService.error("Fetch Items", e.toString());
        }
        setIsLoading(false)
    }

    function mappingData(data: any[]) {
        const items: Record<string, any> = {}
        for(let i = 0; i < data.length; i++) {
            const item = JSON.parse(JSON.stringify(data[i]));
            if(!items[item.items.name]) {
                items[item.items.name] = item;
            } else {
                items[item.items.name].quantity += item.quantity;
            }
        }

        setItems(Object.values(items));
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
    }

    function handleCloseExportModal() {
        setOpenExportModal(false);
    }

    async function handleChangeKeyword(e: any) {
        setKeyword(e.target.value)
        if(e.target.value === "") {
            await fetchItems()
            return
        }

        const temp = localStorage.getItem(DatabaseTables.InventoriesImport);
        let cache = []
        if (!temp) {
            localStorage.setItem(DatabaseTables.InventoriesImport, JSON.stringify(items));
            cache = JSON.parse(JSON.stringify(items));
        } else {
            cache = JSON.parse(temp);
        }

        const matchingItems = cache.filter((i: any) => i.items.name.startsWith(e.target.value));
        setItems(matchingItems)
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
                        <Text>{quantity.toLocaleString("en-US")}</Text>
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
        }
    ];

    const rowExpansion: DataTableRowExpansionProps = {
        content: ({ record }: any) => {
            const data = rootData.filter((r) => r.items.name === record.items.name)
            const time = new Date(record.expired_at!).getTime() - new Date().getTime()
            const status = time < 0 ? ExpiringStatus.EXPIRED : time <= ONE_DAY_MS ? ExpiringStatus.EXPIRING_SOON : ExpiringStatus.FRESH

            return <Stack gap={6} pb={'md'}>
                <Group>
                    <Text style={{width: 70}}>Index</Text>
                    <Text style={{width: 100}}>Quantity</Text>
                    <Text style={{width: 200}}>Quantity Type</Text>
                    <Text style={{width: 200}}>Import Date</Text>
                    <Text style={{width: 200}}>Expire Date</Text>
                    <Text style={{width: 100}}>Status</Text>
                </Group>
                <Divider />
                {
                    data.map((item: any, index: number) => <Group key={`record-${item.items.name}-${index}`}>
                        <Text style={{width: 70}}>{index + 1}</Text>
                        <Text style={{width: 100}}>{item.quantity.toLocaleString("en-US")}</Text>
                        <Text style={{width: 200}}>{item.items.quantity_type}</Text>
                        <Text style={{width: 200}}>{dayjs(item.created_at).format(DISPLAY_TIME_FORMAT)}</Text>
                        <Text style={{width: 200}}>{dayjs(item.expired).format(DISPLAY_TIME_FORMAT)}</Text>
                        <Text style={{width: 100}}>
                            <Badge color={UtilsService.getExpireBadgeColor(status)}>
                                {status}
                            </Badge>
                        </Text>
                    </Group>)
                }
            </Stack>
        }
    }

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
                        <TextInput value={keyword} onChange={handleChangeKeyword} label={"Name"} leftSection={<IconSearch />} />
                    </Group>
                    <Stack gap={2}>
                        <Text style={{
                            fontSize: 14
                        }}>Controls</Text>
                        <Group>
                            <Button
                                color={BUTTON_COLOR.PRIMARY}
                                onClick={() => fetchItems()}
                                leftSection={<IconRefresh/>}>
                                Refresh
                            </Button>
                        </Group>
                    </Stack>
                </Group>
                <Divider />
                <CommonTable rowExpansion={rowExpansion} height={'51vh'} data={items} columns={columns} />
            </Stack>

            <WarehouseItemModal open={openModal} close={handleCloseModal} refresh={fetchItems} />

            <ExportInventoryModal open={openExportModal} refresh={fetchItems} close={handleCloseExportModal} />
        </>
    )
}