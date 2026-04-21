import {ActionIcon, Badge, Button, Divider, Group, LoadingOverlay, Stack, Text, TextInput, Title,} from "@mantine/core";
import {IconEdit, IconPlus, IconRefresh, IconSearch, IconTrash, IconX,} from "@tabler/icons-react";
import {type ChangeEvent, useEffect, useState} from "react";
import type {Items} from "../../../models/items.ts";
import ItemsModal from "./items.modal.tsx";
import CommonTable from "../../dataTable/common.table.tsx";
import OperationService from "../../../services/operations/operationService.ts";
import {DatabaseTables, DISPLAY_TIME_FORMAT,} from "../../../enums/tables.ts";
import type {DataTableColumn} from "mantine-datatable";
import {InformationService} from "../../../services/notifications/information.service.ts";
import {NotificationsService} from "../../../services/notifications/notifications.service.ts";
import dayjs from "dayjs";
import {BUTTON_COLOR} from "../../../enums/styling.ts";

export default function ItemsTab() {
    const [isLoading, setLoading] = useState(true);

    const [items, setItems] = useState<any[]>([]);
    const [cachedTags, setCachedTags] = useState<any[]>([]);

    const [keyword, setKeyword] = useState<string>("");

    const [selectedItem, setSelectedItem] = useState<Items | null>(null);
    const [openItemModal, setOpenItemModal] = useState<boolean>(false);

    useEffect(() => {
        (async () => await fetchItems())();
        (async () => await fetchTags())();
    }, []);

    async function fetchItems() {
        const service = OperationService.getInstance();

        try {
            const data = await service.getAllItems()
            setItems(data);
            localStorage.setItem(DatabaseTables.Items, JSON.stringify(data));
        } catch (e: any) {
            NotificationsService.error("Fetch all items", e.toString());
        }

        setLoading(false);
    }

    async function fetchTags(forced: boolean = false) {
        let data: any[]

        const cache = localStorage.getItem(DatabaseTables.Tags)
        if (!cache) {
            data = await OperationService.getInstance().getAllRows(DatabaseTables.Tags)
            localStorage.setItem(DatabaseTables.Tags, JSON.stringify(data))
        } else {
            data = JSON.parse(cache);
        }

        setCachedTags(data)

        if(forced) {
            data = await OperationService.getInstance().getAllRows(DatabaseTables.Tags)
            localStorage.setItem(DatabaseTables.Tags, JSON.stringify(data))
        }
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
            render: ({name}: any) => {
                return <Group>{name}</Group>;
            },
        },
        {
            accessor: "tags",
            title: "Tags",
            sortable: true,
            render: ({id, tags}: any, index: number) => {
                return (
                    <Group>
                        {tags
                            ? tags.map((tag: any, idx: number) => {
                                let tag_id = tag
                                const cache = cachedTags.find((t: any) => Number(tag) === t.id)
                                if(cache) {
                                    tag_id = cache.name
                                }
                                return (
                                    <Badge key={`item-${id}-tag-${index}-${idx}`}>
                                        {tag_id}
                                    </Badge>
                                )
                            })
                            : "N/A"}
                    </Group>
                );
            },
        },
        {
            accessor: "warning_limit",
            title: "Warning Limit",
            sortable: true,
            render: ({warning_limit}: any) => {
                return <Group>{String(warning_limit)}</Group>;
            },
        },
        {
            accessor: "quantity_type",
            title: "Quantity Type",
            sortable: true,
            render: ({quantity_type}: any) => {
                return <Group>{quantity_type}</Group>;
            },
        },
        {
            accessor: "created_at",
            title: "Created At",
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
            accessor: "updated_at",
            title: "Last Updated At",
            sortable: true,
            render: ({updated_at}: any) => {
                return (
                    <Group>
                        {dayjs(updated_at).format(DISPLAY_TIME_FORMAT)}
                    </Group>
                );
            },
        },
        {
            accessor: "categories",
            title: "Category ID",
            sortable: true,
            width: 175,
            render: ({ categories }: any) => {
                return (
                    <Group>
                        {categories.name}
                    </Group>
                );
            },
        },
        {
            accessor: "actions",
            title: "Actions",
            width: 120,
            render: ({ id }: any) => {
                return (
                    <Group>
                        <ActionIcon
                            color={BUTTON_COLOR.PRIMARY}
                            onClick={() => handleDelete(id)}
                            size={"lg"}>
                            <IconTrash/>
                        </ActionIcon>
                        <ActionIcon
                            color={BUTTON_COLOR.PRIMARY}
                            size={"lg"} onClick={() => handleEdit(id)}>
                            <IconEdit/>
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
                const result = await service.deleteById(DatabaseTables.Items, id);
                if(result.length > 0) {
                    NotificationsService.error("Delete Result", result)
                } else {
                    NotificationsService.success(
                        "Delete Result",
                        "Deleted successfully!",
                    );
                }
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

    async function clearSearch() {
        setKeyword("")
        const temp = localStorage.getItem(DatabaseTables.Items);
        if (!temp) {
            setItems([])
        } else {
            setItems(JSON.parse(temp));
        }
    }

    async function handleSearchByName(e: ChangeEvent<HTMLInputElement>) {
        setKeyword(e.target.value)
        if(e.target.value === "") {
            await clearSearch()
            return
        }

        const temp = localStorage.getItem(DatabaseTables.Items);
        let cache = []
        if (!temp) {
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
                    overlayProps={{radius: "sm", blur: 2}}
                />

                <Stack gap={0}>
                    <Text>Management</Text>
                    <Title>Items Data</Title>
                </Stack>
                <Divider/>

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
                                    <IconX/>
                                </ActionIcon>
                            }
                            <ActionIcon size={"lg"} color={BUTTON_COLOR.PRIMARY}>
                                <IconSearch/>
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
                                onClick={async () => {
                                    await fetchItems()
                                    await fetchTags(true)
                                }}
                                leftSection={<IconRefresh/>}>
                                Refresh
                            </Button>
                        </Group>
                    </Stack>
                </Group>
                <CommonTable data={items} columns={columns}/>
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
