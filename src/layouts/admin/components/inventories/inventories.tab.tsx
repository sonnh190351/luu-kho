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
    IconEdit,
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
import { DatabaseTables } from "../../../../enums/tables.ts";
import { InformationService } from "../../../../services/notifications/information.service.ts";
import { NotificationsService } from "../../../../services/notifications/notifications.service.ts";

export default function InventoriesTab() {
    const [isLoading, setLoading] = useState(true);

    const [items, setInventories] = useState<Inventories[]>([]);

    const [keyword, setKeyword] = useState<string>("");

    const [selectedItem, setSelectedItem] = useState<Inventories | null>(null);
    const [openItemModal, setOpenItemModal] = useState<boolean>(false);

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
            sortable: true,
            render: ({ warehouse_id }: Inventories) => {
                return <Group>{warehouse_id}</Group>;
            },
        },
        {
            accessor: "created_at",
            title: "Created At",
            sortable: true,
            render: ({ created_at }: Inventories) => {
                return <Group>{created_at}</Group>;
            },
        },
        {
            accessor: "updated_at",
            title: "Last Updated At",
            sortable: true,
            render: ({ updated_at }: Inventories) => {
                return <Group>{updated_at}</Group>;
            },
        },
        {
            accessor: "id",
            title: "Actions",
            sortable: true,
            render: ({ id }: Inventories) => {
                return (
                    <Group>
                        <ActionIcon
                            onClick={() => handleDelete(id)}
                            size={"lg"}>
                            <IconTrash />
                        </ActionIcon>
                        <ActionIcon size={"lg"} onClick={() => handleEdit(id)}>
                            <IconEdit />
                        </ActionIcon>
                    </Group>
                );
            },
        },
    ];

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

    function handleEdit(id: number) {
        const matching = items.find((i) => i.id === id);
        if (matching) {
            setSelectedItem(matching);
            setOpenItemModal(true);
        }
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
                            <Button leftSection={<IconRefresh />}>
                                Refresh
                            </Button>
                        </Group>
                    </Stack>
                </Group>

                <CommonTable data={items} columns={columns} />
            </Stack>

            {/*Item modal*/}
            <InventoriesModal
                inventory={selectedItem}
                open={openItemModal}
                refresh={fetchInventories}
                close={handleCloseItemModal}
            />
        </>
    );
}
