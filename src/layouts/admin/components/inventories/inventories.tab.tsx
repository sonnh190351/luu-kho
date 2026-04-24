import {
    ActionIcon,
    Button, Divider,
    Group,
    LoadingOverlay,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import {
    IconPlus,
    IconRefresh,
    IconSearch,
    IconX,
} from "@tabler/icons-react";
import {type ChangeEvent, useEffect, useState} from "react";
import type {Inventories} from "../../../../models/inventories.ts";
import CommonTable from "../../../../components/dataTable/common.table.tsx";
import OperationService from "../../../../services/operations/operationService.ts";
import InventoriesModal from "./inventories.modal.tsx";
import {
    DatabaseTables,
    DISPLAY_TIME_FORMAT,
} from "../../../../enums/tables.ts";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import dayjs from "dayjs";
import {BUTTON_COLOR} from "../../../../enums/styling.ts";
import type {DataTableRowExpansionProps} from "mantine-datatable";

export default function InventoriesTab() {
    const [isLoading, setLoading] = useState(true);

    const [rootData, setRootData] = useState<Inventories[]>([]);
    const [inventories, setInventories] = useState<Inventories[]>([]);

    const [keyword, setKeyword] = useState<string>("");

    const [openItemModal, setOpenItemModal] = useState<boolean>(false);

    useEffect(() => {
        (async () => await fetchInventories())();
    }, []);

    async function fetchInventories() {
        const service = OperationService.getInstance();

        try {
            const data = await service.getAllInventoriesImportItems()
            mappingData(data)
            setRootData(data)
        } catch (e: any) {
            NotificationsService.error("Fetch categories", e.toString());
        }

        setLoading(false);
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

        setInventories(Object.values(items));
    }

    function handleCloseItemModal() {
        setOpenItemModal(false);
    }

    const rowExpansion: DataTableRowExpansionProps = {
        content: ({ record }: any) => {
            const data = rootData.filter((r) => r.items.name === record.items.name)

            return <Stack gap={6} pb={'md'}>
                <Group>
                    <Text style={{width: 70}}>Index</Text>
                    <Text style={{width: 100}}>Quantity</Text>
                    <Text style={{width: 200}}>Quantity Type</Text>
                    <Text style={{width: 200}}>Import Date</Text>
                </Group>
                <Divider />
                {
                    data.map((item: any, index: number) => <Group key={`record-${item.items.name}-${index}`}>
                        <Text style={{width: 70}}>{index + 1}</Text>
                        <Text style={{width: 100}}>{item.quantity}</Text>
                        <Text style={{width: 200}}>{item.items.quantity_type}</Text>
                        <Text style={{width: 200}}>{dayjs(item.created_at).format(DISPLAY_TIME_FORMAT)}</Text>
                    </Group>)
                }
            </Stack>
        }
    }

    const columns: any[] = [
        {
            accessor: "items",
            title: "Items",
            sortable: false,
            width: 150,
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
            accessor: "warehouses",
            title: "Warehouse",
            sortable: true,
            width: 185,
            render: ({warehouses}: Inventories) => {
                return (
                    <Group>
                        <Text>{warehouses.name}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "warehouses address",
            title: "Warehouse Address",
            sortable: false,
            width: 185,
            render: ({warehouses}: Inventories) => {
                return (
                    <Group>
                        <Text>{warehouses.address}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "created_at",
            title: "Created At",
            sortable: true,
            width: 250,
            render: ({created_at}: Inventories) => {
                return (
                    <Group>
                        {dayjs(created_at).format(DISPLAY_TIME_FORMAT)}
                    </Group>
                );
            },
        }
    ];

    async function clearSearch(){
        setKeyword("")
        const temp = localStorage.getItem(DatabaseTables.InventoriesImport);
        if(!temp) {
            setInventories([])
        } else {
            setInventories(JSON.parse(temp));
        }
    }

    async function handleSearchByWarehouseId(e: ChangeEvent<HTMLInputElement>) {
        setKeyword(e.target.value)

        const temp = localStorage.getItem(DatabaseTables.InventoriesImport);
        let cache = []
        if(!temp) {
            localStorage.setItem(DatabaseTables.InventoriesImport, JSON.stringify(inventories));
            cache = JSON.parse(JSON.stringify(inventories));
        } else {
            cache = JSON.parse(temp);
        }

        const matchingItems = cache.filter((i: any) => String(i.warehouse_id).startsWith(e.target.value));
        setInventories(matchingItems)
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
                    <Title>Inventories Import Data</Title>
                </Stack>
                <Divider/>

                <Group justify={"space-between"}>
                    <Stack gap={5}>
                        <Text>Filter</Text>
                        <Group>
                            <TextInput
                                placeholder={"Search by Warehouse ID"}
                                value={keyword}
                                onChange={handleSearchByWarehouseId}
                            />
                            {
                                keyword.length > 0 && <ActionIcon onClick={clearSearch} size={"lg"} color={'red'}>
                                    <IconX />
                                </ActionIcon>
                            }
                            <ActionIcon color={BUTTON_COLOR.PRIMARY} size={"lg"}>
                                <IconSearch />
                            </ActionIcon>
                        </Group>
                    </Stack>
                    <Stack gap={5}>
                        <Text>Controls</Text>
                        <Group>
                            <Button
                                color={BUTTON_COLOR.PRIMARY}
                                onClick={() => setOpenItemModal(true)}
                                leftSection={<IconPlus/>}>
                                Add
                            </Button>
                            <Button
                                color={BUTTON_COLOR.PRIMARY}
                                onClick={() => fetchInventories()}
                                leftSection={<IconRefresh/>}>
                                Refresh
                            </Button>
                        </Group>
                    </Stack>
                </Group>

                <CommonTable rowExpansion={rowExpansion} data={inventories} columns={columns}/>
            </Stack>

            {/*Item modal*/}
            <InventoriesModal
                open={openItemModal}
                refresh={fetchInventories}
                close={handleCloseItemModal}
            />
        </>
    );
}
