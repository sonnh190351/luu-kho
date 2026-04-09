import {ActionIcon, Button, Divider, Group, Stack, Text, TextInput, Title} from "@mantine/core";
import {useEffect, useState} from "react";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import {LocalStorage} from "../../../../enums/localStorage.ts";
import OperationService from "../../../../services/operations/operationService.ts";
import CommonTable from "../../../../components/dataTable/common.table.tsx";
import type {DataTableColumn} from "mantine-datatable";
import {IconRefresh, IconX} from "@tabler/icons-react";
import {DatabaseTables} from "../../../../enums/tables.ts";
import {BUTTON_COLOR} from "../../../../enums/styling.ts";

export default function ManagerStatusTab() {

    const [keyword, setKeyword] = useState<string>("");

    const cachedData = localStorage.getItem(LocalStorage.userData);

    const loginData = JSON.parse(cachedData!);

    const warehouse_id = loginData.warehouses.id;

    const [data, setData] = useState<any[]>([])

    useEffect(() => {
        (async () => await fetchStatus())();
    }, [])

    async function fetchStatus() {
        try {
            if (warehouse_id !== null) {
                const service = OperationService.getInstance();
                const data = await service.getWarehouseStatus(warehouse_id)
                setData(data);
                console.log(data)
            }
        } catch (e: any) {
            NotificationsService.error("Fetch Status", e.toString())
        }
    }

    const columns: DataTableColumn[] = [
        {
            accessor: "id",
            title: "ID",
            width: 170,
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
            accessor: "name",
            title: "Name",
            sortable: true,
            render: ({items}: any) => {
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
            width: 200,
            render: ({quantity}: any) => {
                return (
                    <Group>
                        <Text>{quantity}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "quantity_type",
            title: "Quantity Type",
            width: 200,
            render: ({items}: any) => {
                return (
                    <Group>
                        <Text>{items.quantity_type}</Text>
                    </Group>
                );
            },
        },
    ]

    function handleSearchByName(e: any) {
        const keyword = e.target.value
        setKeyword(keyword);

        const cache = localStorage.getItem(DatabaseTables.InventoryStatus);
        let temp: any[] = []

        if (cache) {
            temp = JSON.parse(cache);
        } else {
            localStorage.setItem(DatabaseTables.InventoryStatus, JSON.stringify(data));
            temp = data
        }

        const filtered = temp.filter((d) => d.items.name.startsWith(keyword));
        setData(filtered)
    }

    async function clearSearch() {
        setKeyword("")
        await fetchStatus()
    }

    return (
        <>
            <Stack pt={"lg"} pl={"sm"}>
                <Stack gap={0}>
                    <Text>Management</Text>
                    <Title>Warehouse Inventory Status</Title>
                </Stack>
                <Divider/>

                <Stack gap={5}>
                    <Text>Filter</Text>
                    <Group justify={'space-between'}>
                        <Group>
                            <TextInput
                                placeholder={"Search by Name"}
                                value={keyword}
                                onChange={handleSearchByName}
                            />
                            {
                                keyword.length > 0 && <ActionIcon onClick={clearSearch} size={"lg"} color={'red'}>
                                    <IconX/>
                                </ActionIcon>
                            }
                        </Group>

                        <Button
                            color={BUTTON_COLOR.PRIMARY}
                            onClick={fetchStatus}
                            leftSection={<IconRefresh/>}>
                            Refresh
                        </Button>
                    </Group>

                </Stack>

                <CommonTable data={data} columns={columns}/>
            </Stack>
        </>
    )
}