import {
    ActionIcon,
    Button,
    Divider,
    Group,
    LoadingOverlay,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import {
    IconInfoCircle,
    IconPlus,
    IconRefresh,
    IconSearch,
    IconTrash,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import type { Inventories } from "../../../../models/inventories.ts";
import CommonTable from "../../../../components/dataTable/common.table.tsx";
import InventoryService from "../../../../services/operations/inventory.service.ts";
import InventoriesModal from "./inventories.modal.tsx";
import {
    DatabaseTables,
    DISPLAY_TIME_FORMAT,
} from "../../../../enums/tables.ts";
import { InformationService } from "../../../../services/notifications/information.service.ts";
import { NotificationsService } from "../../../../services/notifications/notifications.service.ts";
import InventoryTicketsModal from "./inventories.items.modal.tsx";
import dayjs from "dayjs";

export default function InventoriesTab() {
    const [isLoading, setLoading] = useState(true);

    const [items, setInventories] = useState<Inventories[]>([]);

    const [keyword, setKeyword] = useState<string>("");

    const [selectedItem, setSelectedItem] = useState<Inventories | null>(null);
    const [openItemModal, setOpenItemModal] = useState<boolean>(false);
    const [openInventoryTicketsModal, setOpenInventoryTicketsModal] =
        useState<boolean>(false);

    useEffect(() => {
        (async () => await fetchInventories())();
    }, []);

    async function fetchInventories() {
        const service = InventoryService.getInstance();

        try {
            const data = await service.getAllRows(DatabaseTables.Inventories);
            setInventories(data);
        } catch (e: any) {
            NotificationsService.error("Fetch categories", e.toString());
        }

        setLoading(false);
    }

    function handleCloseItemModal() {
        setOpenItemModal(false);
    }

    function handleCloseInventoryTicketsModal() {
        setOpenInventoryTicketsModal(false);
        setTimeout(() => {
            setSelectedItem(null);
        }, 200);
    }

    const columns: any[] = [
        {
            accessor: "id",
            title: "ID",
            sortable: true,
            render: ({ id }: Inventories) => {
                return (
                    <Group>
                        <Text>{id}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "warehouse_id",
            title: "Warehouse ID",
            sortable: false,
            width: 185,
            render: ({ warehouse_id }: Inventories) => {
                return (
                    <Button
                        style={{
                            width: "100%",
                        }}
                        leftSection={<IconInfoCircle />}
                        onClick={() => {
                            InformationService.getInstance().showItemDetailsById(
                                DatabaseTables.Warehouses,
                                "Warehouse Details",
                                warehouse_id!,
                            );
                        }}>
                        Details ({warehouse_id})
                    </Button>
                );
            },
        },
        {
            accessor: "created_at",
            title: "Created At",
            sortable: true,
            render: ({ created_at }: Inventories) => {
                return (
                    <Group>
                        {dayjs(created_at).format(DISPLAY_TIME_FORMAT)}
                    </Group>
                );
            },
        },
        {
            accessor: "updated_at",
            title: "Updated At",
            sortable: true,
            render: ({ updated_at }: Inventories) => {
                return (
                    <Group>
                        {dayjs(updated_at).format(DISPLAY_TIME_FORMAT)}
                    </Group>
                );
            },
        },
        {
            accessor: "id",
            title: "Items",
            sortable: false,
            width: 150,
            render: ({ id }: Inventories) => {
                return (
                    <Button
                        leftSection={<IconInfoCircle />}
                        onClick={() => handleInventoryTickets(id)}
                        size={"sm"}>
                        Items List
                    </Button>
                );
            },
        },
        {
            accessor: "id",
            title: "Actions",
            sortable: false,
            width: 80,
            render: ({ id }: Inventories) => {
                return (
                    <Group>
                        <ActionIcon
                            style={{
                                width: "100%",
                            }}
                            onClick={() => handleDelete(id)}
                            size={"lg"}>
                            <IconTrash />
                        </ActionIcon>
                    </Group>
                );
            },
        },
    ];

    function handleInventoryTickets(id: number) {
        const matching = items.find((i) => i.id === id);
        if (matching) {
            setSelectedItem(matching);
            setOpenInventoryTicketsModal(true);
        }
    }

    function handleDelete(id: number) {
        InformationService.getInstance().confirm(async () => {
            try {
                const service = InventoryService.getInstance();
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

    return (
        <>
            <Stack pt={"lg"} pl={"sm"}>
                <LoadingOverlay
                    visible={isLoading}
                    overlayProps={{ radius: "sm", blur: 2 }}
                />

                <Title>Inventories Management</Title>

                <Group justify={"end"}>
                    <Stack gap={5}>
                        <Text>Filter</Text>
                        <Group>
                            <TextInput
                                placeholder={"Search by Name"}
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                            <ActionIcon size={"lg"}>
                                <IconSearch />
                            </ActionIcon>
                        </Group>
                    </Stack>
                    <Divider orientation={"vertical"} />
                    <Stack gap={5}>
                        <Text>Controls</Text>
                        <Group>
                            <Button
                                onClick={() => setOpenItemModal(true)}
                                leftSection={<IconPlus />}>
                                Add
                            </Button>
                            <Button
                                onClick={() => fetchInventories()}
                                leftSection={<IconRefresh />}>
                                Refresh
                            </Button>
                        </Group>
                    </Stack>
                </Group>

                <CommonTable data={items} columns={columns} />
            </Stack>

            {/*Item modal*/}
            <InventoriesModal
                open={openItemModal}
                refresh={fetchInventories}
                close={handleCloseItemModal}
            />

            <InventoryTicketsModal
                inventory={selectedItem}
                open={openInventoryTicketsModal}
                close={handleCloseInventoryTicketsModal}
            />
        </>
    );
}
