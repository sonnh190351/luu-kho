import {
    ActionIcon,
    Badge,
    Button,
    Group,
    Stack,
    Text,
    TextInput,
    LoadingOverlay,
    Title,
} from "@mantine/core";
import {
    IconEdit,
    IconInfoCircle,
    IconPlus,
    IconRefresh,
    IconSearch,
    IconTrash, IconX,
} from "@tabler/icons-react";
import {type ChangeEvent, useEffect, useState} from "react";
import type { Items } from "../../../../models/items.ts";
import ItemsModal from "./items.modal.tsx";
import CommonTable from "../../../../components/dataTable/common.table.tsx";
import InventoryService from "../../../../services/operations/inventory.service.ts";
import {
    DatabaseTables,
    DISPLAY_TIME_FORMAT,
} from "../../../../enums/tables.ts";
import type { DataTableColumn } from "mantine-datatable";
import { InformationService } from "../../../../services/notifications/information.service.ts";
import { NotificationsService } from "../../../../services/notifications/notifications.service.ts";
import dayjs from "dayjs";

export default function ItemsTab() {
    const [isLoading, setLoading] = useState(true);

    const [items, setItems] = useState<Items[]>([]);

    const [keyword, setKeyword] = useState<string>("");

    const [selectedItem, setSelectedItem] = useState<Items | null>(null);
    const [openItemModal, setOpenItemModal] = useState<boolean>(false);

    useEffect(() => {
        (async () => await fetchItems())();
    }, []);

    async function fetchItems() {
        const service = InventoryService.getInstance();

        try {
            const data = await service.getAllRows(DatabaseTables.Items);
            setItems(data);
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

    const columns: DataTableColumn[] = [
        {
            accessor: "id",
            title: "ID",
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
            accessor: "name",
            title: "Name",
            sortable: true,
            render: ({ name }: any) => {
                return <Group>{name}</Group>;
            },
        },
        {
            accessor: "tags",
            title: "Tags",
            sortable: true,
            render: ({ id, tags }: any, index: number) => {
                return (
                    <Group>
                        {tags
                            ? tags.map((tag: any, idx: number) => (
                                  <Badge key={`item-${id}-tag-${index}-${idx}`}>
                                      {tag}
                                  </Badge>
                              ))
                            : "N/A"}
                    </Group>
                );
            },
        },
        {
            accessor: "warning_limit",
            title: "Warning Limit",
            sortable: true,
            render: ({ warning_limit }: any) => {
                return <Group>{String(warning_limit)}</Group>;
            },
        },
        {
            accessor: "quantity_type",
            title: "Quantity Type",
            sortable: true,
            render: ({ quantity_type }: any) => {
                return <Group>{quantity_type}</Group>;
            },
        },
        {
            accessor: "created_at",
            title: "Created At",
            sortable: true,
            render: ({ created_at }: any) => {
                return (
                    <Group>
                        {dayjs(created_at).format(DISPLAY_TIME_FORMAT)}
                    </Group>
                );
            },
        },
        {
            accessor: "updated_at",
            title: "Last Updated At",
            sortable: true,
            render: ({ updated_at }: any) => {
                return (
                    <Group>
                        {dayjs(updated_at).format(DISPLAY_TIME_FORMAT)}
                    </Group>
                );
            },
        },
        {
            accessor: "category_id",
            title: "Category ID",
            sortable: true,
            width: 175,
            render: ({ category_id }: any) => {
                return (
                    <Button
                        style={{
                            width: "100%",
                        }}
                        leftSection={<IconInfoCircle />}
                        onClick={() => {
                            InformationService.getInstance().showItemDetailsById(
                                DatabaseTables.Categories,
                                "Category Details",
                                category_id!,
                            );
                        }}>
                        Details ({category_id})
                    </Button>
                );
            },
        },
        {
            accessor: "supplier_id",
            title: "Supplier ID",
            sortable: true,
            width: 175,
            render: ({ supplier_id }: any) => {
                return (
                    <Button
                        style={{
                            width: "100%",
                        }}
                        leftSection={<IconInfoCircle />}
                        onClick={() => {
                            InformationService.getInstance().showItemDetailsById(
                                DatabaseTables.Suppliers,
                                "Supplier Details",
                                supplier_id!,
                            );
                        }}>
                        Details ({supplier_id})
                    </Button>
                );
            },
        },
        {
            accessor: "id",
            title: "Actions",
            width: 120,
            render: ({ id }: any) => {
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
                await service.deleteById(DatabaseTables.Items, id);
                NotificationsService.success(
                    "Delete Item",
                    "Item has been deleted!",
                );
            } catch (e: any) {
                NotificationsService.error("Delete Item", e.toString());
            }
            await fetchItems();
        });
    }

    function handleEdit(id: number) {
        const matching = items.find((i) => i.id === id);
        if (matching) {
            setSelectedItem(matching);
            setOpenItemModal(true);
        }
    }

    async function clearSearch(){
        setKeyword("")
        const temp = localStorage.getItem(DatabaseTables.Items);
        if(!temp) {
            setItems([])
        } else {
            setItems(JSON.parse(temp));
        }
    }

    async function handleSearchByName(e: ChangeEvent<HTMLInputElement>) {
        setKeyword(e.target.value)

        const temp = localStorage.getItem(DatabaseTables.Items);
        let cache = []
        if(!temp) {
            localStorage.setItem(DatabaseTables.Items, JSON.stringify(items));
            cache = JSON.parse(JSON.stringify(items));
        } else {
            cache = JSON.parse(temp);
        }

        const matchingItems = cache.filter((i: any) => i.name.startsWith(e.target.value));
        setItems(matchingItems)
    }

    return (
        <>
            <Stack pt={"lg"} pl={"sm"}>
                <LoadingOverlay
                    visible={isLoading}
                    overlayProps={{ radius: "sm", blur: 2 }}
                />

                <Title>Items Management</Title>

                <Group justify={"space-between"}>
                    <Stack gap={5}>
                        <Text>Filter</Text>
                        <Group>
                            <TextInput
                                placeholder={"Search by Name"}
                                value={keyword}
                                onChange={handleSearchByName}
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
                                leftSection={<IconPlus />}>
                                Add
                            </Button>
                            <Button
                                onClick={() => fetchItems()}
                                leftSection={<IconRefresh />}>
                                Refresh
                            </Button>
                        </Group>
                    </Stack>
                </Group>
                <CommonTable data={items} columns={columns} />
            </Stack>

            {/*Item modal*/}
            <ItemsModal
                item={selectedItem}
                open={openItemModal}
                refresh={fetchItems}
                close={handleCloseItemModal}
            />
        </>
    );
}
