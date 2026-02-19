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
import type { Categories } from "../../../../models/categories.ts";
import CommonTable from "../../../../components/dataTable/common.table.tsx";
import InventoryService from "../../../../services/operations/inventory.service.ts";
import CategoriesModal from "./categories.modal.tsx";
import {
    DatabaseTables,
    DISPLAY_TIME_FORMAT,
} from "../../../../enums/tables.ts";
import { InformationService } from "../../../../services/notifications/information.service.ts";
import { NotificationsService } from "../../../../services/notifications/notifications.service.ts";
import dayjs from "dayjs";

export default function CategoriesTab() {
    const [isLoading, setLoading] = useState(true);

    const [categories, setCategories] = useState<Categories[]>([]);

    const [keyword, setKeyword] = useState<string>("");

    const [selectedCategory, setSelectedCategory] = useState<Categories | null>(
        null,
    );
    const [openCategoryModal, setOpenCategoryModal] = useState<boolean>(false);

    useEffect(() => {
        (async () => await fetchCategories())();
    }, []);

    async function fetchCategories() {
        const service = InventoryService.getInstance();

        try {
            const data = await service.getAllRows(DatabaseTables.Categories);
            setCategories(data);
        } catch (e: any) {
            NotificationsService.error("Fetch categories", e.toString());
        }

        setLoading(false);
    }

    function handleCloseItemModal() {
        setOpenCategoryModal(false);
        setTimeout(() => {
            setSelectedCategory(null);
        }, 200);
    }

    const columns: any[] = [
        {
            accessor: "id",
            title: "ID",
            sortable: true,
            render: ({ id }: Categories) => {
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
            render: ({ name }: Categories) => {
                return <Group>{name}</Group>;
            },
        },
        {
            accessor: "created_at",
            title: "Created At",
            sortable: true,
            render: ({ created_at }: Categories) => {
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
            render: ({ updated_at }: Categories) => {
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
            sortable: true,
            width: 120,
            render: ({ id }: Categories) => {
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
                await service.deleteById(DatabaseTables.Categories, id);
                NotificationsService.success(
                    "Delete Category",
                    "Category has been deleted!",
                );
            } catch (e: any) {
                NotificationsService.error("Delete Category", e.toString());
            }
            await fetchCategories();
        });
    }

    function handleEdit(id: number) {
        const matching = categories.find((c) => c.id === id);
        if (matching) {
            setSelectedCategory(matching);
            setOpenCategoryModal(true);
        }
    }

    return (
        <>
            <Stack pt={"lg"} pl={"sm"}>
                <LoadingOverlay
                    visible={isLoading}
                    overlayProps={{ radius: "sm", blur: 2 }}
                />
                <Title>Categories Management</Title>

                <Group justify={"space-between"}>
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
                    <Stack gap={5}>
                        <Text>Controls</Text>
                        <Group>
                            <Button
                                onClick={() => setOpenCategoryModal(true)}
                                leftSection={<IconPlus />}>
                                Add
                            </Button>
                            <Button
                                onClick={() => fetchCategories()}
                                leftSection={<IconRefresh />}>
                                Refresh
                            </Button>
                        </Group>
                    </Stack>
                </Group>

                <CommonTable data={categories} columns={columns} />
            </Stack>

            {/*Item modal*/}
            <CategoriesModal
                category={selectedCategory}
                open={openCategoryModal}
                refresh={fetchCategories}
                close={handleCloseItemModal}
            />
        </>
    );
}
