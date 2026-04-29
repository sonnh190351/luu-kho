import {ActionIcon, Button, Divider, Group, LoadingOverlay, Stack, Text, TextInput, Title} from "@mantine/core";
import {useEffect, useState} from "react";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import OperationService from "../../../../services/operations/operationService.ts";
import CommonTable from "../../../../components/dataTable/common.table.tsx";
import type {DataTableColumn, DataTableRowExpansionProps} from "mantine-datatable";
import {LocalStorage} from "../../../../enums/localStorage.ts";
import dayjs from "dayjs";
import {DatabaseTables, DISPLAY_TIME_FORMAT} from "../../../../enums/tables.ts";
import {IconRefresh, IconX} from "@tabler/icons-react";
import {BUTTON_COLOR} from "../../../../enums/styling.ts";

export default function ManagerInventoryExportTab() {
    const [keyword, setKeyword] = useState("");

    const cachedData = localStorage.getItem(LocalStorage.userData)!;
    const loginData = JSON.parse(cachedData!);
    const warehouse_id = loginData.warehouses.id;

    const [isLoading, setIsLoading] = useState(true);

    const [data, setData] = useState<any[]>([]);
    const [rootData, setRootData] = useState<any[]>([]);

    useEffect(() => {
        (async () => await fetchExportData())();
    }, []);

    async function fetchExportData() {
        setIsLoading(true);
        try {
            // Fetch data tu db
            const service = OperationService.getInstance()
            const data = await service.getWarehouseInventoriesExportItem(warehouse_id)
            mappingData(data)
            setRootData(data)
        } catch (e: any) {
            NotificationsService.error("Fetch Export Data", e.toString())
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

        setData(Object.values(items));
    }

    const columns: DataTableColumn[] = [
        {
            accessor: "id",
            title: "ID",
            width: 50,
            sortable: true,
            render: ({ id }: any) => {
                return (
                    <Group>
                        <Text>{id}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "item_name",
            title: "Item",
            width: 170,
            sortable: true,
            render: ({ items }: any) => {
                return (
                    <Group>
                        <Text>{items.name}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "quantity",
            title: "Quantity",           width: 170,
            sortable: true,
            render: ({ quantity }: any) => {
                return (
                    <Group>
                        <Text>{quantity.toLocaleString("en-US")}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "quantity_type",
            title: "Quantity Type",
            width: 170,
            sortable: true,
            render: ({ items }: any) => {
                return (
                    <Group>
                        <Text>{items.quantity_type}</Text>
                    </Group>
                );
            },
        },
    ]

    const rowExpansion: DataTableRowExpansionProps = {
        content: ({ record }: any) => {
            const data = rootData.filter((r) => r.items.name === record.items.name)

            return <Stack gap={6} pb={'md'}>
                <Group>
                    <Text style={{width: 70}}>Index</Text>
                    <Text style={{width: 300}}>Dish</Text>
                    <Text style={{width: 100}}>Quantity</Text>
                    <Text style={{width: 200}}>Quantity Type</Text>
                    <Text style={{width: 200}}>Export Date</Text>
                </Group>
                <Divider />
                {
                    data.map((item: any, index: number) => <Group key={`record-${item.items.name}-${index}`}>
                        <Text style={{width: 70}}>{index + 1}</Text>
                        <Text style={{width: 300}}>{item.orders.products.name}</Text>
                        <Text style={{width: 100}}>{item.quantity.toLocaleString("en-US")}</Text>
                        <Text style={{width: 200}}>{item.items.quantity_type}</Text>
                        <Text style={{width: 200}}>{dayjs(item.created_at).format(DISPLAY_TIME_FORMAT)}</Text>
                    </Group>)
                }
            </Stack>
        }
    }

    async function handleSearch(e: any) {
        setKeyword(e.target.value);

        if(e.target.value === "") {
            await fetchExportData()
            return
        }

        const cache = sessionStorage.getItem(DatabaseTables.InventoriesExport);
        let cachedData = []
        if(!cache) {
            sessionStorage.setItem(DatabaseTables.InventoriesExport, JSON.stringify(data));
            cachedData = data
        } else {
            cachedData = JSON.parse(cache)
        }

        const filtered = cachedData.filter((c: any) => c.items.name.startsWith(e.target.value))
        setData(filtered)
    }

    async function handleClear() {
        setKeyword("");
        await fetchExportData();
    }

    return <Stack pt={"lg"} pl={"sm"}>
        <LoadingOverlay
            visible={isLoading}
            overlayProps={{radius: "sm", blur: 2}}
        />
        <Stack gap={0}>
            <Text>Management</Text>
            <Title>Warehouse Inventories Export Ticket</Title>
        </Stack>
        <Divider/>

        <Stack gap={5}>
            <Text>Filter</Text>
            <Group justify={'space-between'}>
                <Group>
                    <TextInput
                        value={keyword}
                        onChange={handleSearch}
                        placeholder={"Search by Name"}
                    />
                    {
                        keyword.length > 0 && <ActionIcon color={'red'} onClick={handleClear}>
                        <IconX />
                        </ActionIcon>
                    }
                </Group>

                <Button
                    onClick={fetchExportData}
                    color={BUTTON_COLOR.PRIMARY}
                    leftSection={<IconRefresh/>}>
                    Refresh
                </Button>
            </Group>

        </Stack>

        <CommonTable rowExpansion={rowExpansion} data={data} columns={columns} />
    </Stack>
}