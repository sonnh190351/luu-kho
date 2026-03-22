import {
    ActionIcon,
    Button,
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
    IconTrash, IconX,
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
import {InformationService} from "../../../../services/notifications/information.service.ts";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import dayjs from "dayjs";

export default function InventoriesTab() {
    const [isLoading, setLoading] = useState(true);

    const [items, setInventories] = useState<Inventories[]>([]);

    const [keyword, setKeyword] = useState<string>("");

    const [openItemModal, setOpenItemModal] = useState<boolean>(false);

    useEffect(() => {
        (async () => await fetchInventories())();
    }, []);

    async function fetchInventories() {
        const service = OperationService.getInstance();

        try {
            const data = await service.getAllInventoryItems()
            console.log(data)
            setInventories(data);
        } catch (e: any) {
            NotificationsService.error("Fetch categories", e.toString());
        }

        setLoading(false);
    }

    function handleCloseItemModal() {
        setOpenItemModal(false);
    }

    const columns: any[] = [
        {
            accessor: "id",
            title: "ID",
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
            accessor: "expired_at",
            title: "Expired At",
            sortable: true,
            render: ({expired_at}: Inventories) => {
                return (
                    <Group>
                        {dayjs(expired_at).format(DISPLAY_TIME_FORMAT)}
                    </Group>
                );
            },
        },
        {
            accessor: "created_at",
            title: "Created At",
            sortable: true,
            render: ({created_at}: Inventories) => {
                return (
                    <Group>
                        {dayjs(created_at).format(DISPLAY_TIME_FORMAT)}
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
                        <ActionIcon
                            style={{
                                width: "100%",
                            }}
                            onClick={() => handleDelete(id)}
                            size={"lg"}>
                            <IconTrash/>
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
                await service.deleteById(DatabaseTables.Inventories, id);
                NotificationsService.success(
                    "Delete Inventory",
                    "Inventory has been deleted!",
                );
            } catch (e: any) {
                NotificationsService.error("Delete Inventory", e.toString());
            }
            await fetchInventories();
        });
    }

    async function clearSearch(){
        setKeyword("")
        const temp = localStorage.getItem(DatabaseTables.Inventories);
        if(!temp) {
            setInventories([])
        } else {
            setInventories(JSON.parse(temp));
        }
    }

    async function handleSearchByWarehouseId(e: ChangeEvent<HTMLInputElement>) {
        setKeyword(e.target.value)

        const temp = localStorage.getItem(DatabaseTables.Inventories);
        let cache = []
        if(!temp) {
            localStorage.setItem(DatabaseTables.Inventories, JSON.stringify(items));
            cache = JSON.parse(JSON.stringify(items));
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

                <Title>Inventories Management</Title>

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
                            <ActionIcon size={"lg"}>
                                <IconSearch />
                            </ActionIcon>
                        </Group>
                    </Stack>
                    <Stack gap={5}>
                        <Text>Controls</Text>
                        <Group>
                            <Button
                                onClick={() => setOpenItemModal(true)}
                                leftSection={<IconPlus/>}>
                                Add
                            </Button>
                            <Button
                                onClick={() => fetchInventories()}
                                leftSection={<IconRefresh/>}>
                                Refresh
                            </Button>
                        </Group>
                    </Stack>
                </Group>

                <CommonTable data={items} columns={columns}/>
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
