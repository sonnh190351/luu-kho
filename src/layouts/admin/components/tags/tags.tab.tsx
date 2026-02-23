import {
    ActionIcon,
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
    IconPlus,
    IconRefresh,
    IconSearch,
    IconTrash, IconX,
} from "@tabler/icons-react";
import {type ChangeEvent, useEffect, useState} from "react";
import type { Tags } from "../../../../models/tags.ts";
import CommonTable from "../../../../components/dataTable/common.table.tsx";
import InventoryService from "../../../../services/operations/inventory.service.ts";
import TagsModal from "./tags.modal.tsx";
import {
    DatabaseTables,
    DISPLAY_TIME_FORMAT,
} from "../../../../enums/tables.ts";
import { InformationService } from "../../../../services/notifications/information.service.ts";
import { NotificationsService } from "../../../../services/notifications/notifications.service.ts";
import dayjs from "dayjs";

export default function TagsTab() {
    const [isLoading, setLoading] = useState(true);

    const [items, setTags] = useState<Tags[]>([]);

    const [keyword, setKeyword] = useState<string>("");

    const [selectedItem, setSelectedItem] = useState<Tags | null>(null);
    const [openItemModal, setOpenItemModal] = useState<boolean>(false);

    useEffect(() => {
        (async () => await fetchTags())();
    }, []);

    async function fetchTags() {
        const service = InventoryService.getInstance();

        try {
            const data = await service.getAllRows(DatabaseTables.Tags);
            setTags(data);
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
            render: ({ id }: Tags) => {
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
            render: ({ name }: Tags) => {
                return <Group>{name}</Group>;
            },
        },
        {
            accessor: "created_at",
            title: "Created At",
            sortable: true,
            render: ({ created_at }: Tags) => {
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
            render: ({ updated_at }: Tags) => {
                return (
                    <Group>
                        {dayjs(updated_at).format(DISPLAY_TIME_FORMAT)}
                    </Group>
                );
            },
        },
        {
            accessor: "id",
            title: "Actions",
            width: 120,
            render: ({ id }: Tags) => {
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
                await service.deleteById(DatabaseTables.Tags, id);
                NotificationsService.success(
                    "Delete Tag",
                    "Tag has been deleted!",
                );
            } catch (e: any) {
                NotificationsService.error("Delete Tag", e.toString());
            }
            await fetchTags();
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
        const temp = localStorage.getItem(DatabaseTables.Tags);
        if(!temp) {
            setTags([])
        } else {
            setTags(JSON.parse(temp));
        }
    }

    async function handleSearchByName(e: ChangeEvent<HTMLInputElement>) {
        setKeyword(e.target.value)

        const temp = localStorage.getItem(DatabaseTables.Tags);
        let cache = []
        if(!temp) {
            localStorage.setItem(DatabaseTables.Tags, JSON.stringify(items));
            cache = JSON.parse(JSON.stringify(items));
        } else {
            cache = JSON.parse(temp);
        }

        const matchingItems = cache.filter((i: any) => i.name.startsWith(e.target.value));
        setTags(matchingItems)
    }

    return (
        <>
            <Stack pt={"lg"} pl={"sm"}>
                <LoadingOverlay
                    visible={isLoading}
                    overlayProps={{ radius: "sm", blur: 2 }}
                />

                <Title>Tags Management</Title>

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
                                onClick={fetchTags}
                                leftSection={<IconRefresh />}>
                                Refresh
                            </Button>
                        </Group>
                    </Stack>
                </Group>

                <CommonTable data={items} columns={columns} />
            </Stack>

            {/*Item modal*/}
            <TagsModal
                tag={selectedItem}
                open={openItemModal}
                refresh={fetchTags}
                close={handleCloseItemModal}
            />
        </>
    );
}
