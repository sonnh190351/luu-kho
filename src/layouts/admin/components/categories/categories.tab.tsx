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
    IconEdit,
    IconPlus,
    IconRefresh,
    IconSearch,
    IconTrash, IconX,
} from "@tabler/icons-react";
import {type ChangeEvent, useEffect, useState} from "react";
import type { Categories } from "../../../../models/categories.ts";
import CommonTable from "../../../../components/dataTable/common.table.tsx";
import OperationService from "../../../../services/operations/operationService.ts";
import CategoriesModal from "./categories.modal.tsx";
import {
    DatabaseTables,
    DISPLAY_TIME_FORMAT,
} from "../../../../enums/tables.ts";
import { InformationService } from "../../../../services/notifications/information.service.ts";
import { NotificationsService } from "../../../../services/notifications/notifications.service.ts";
import dayjs from "dayjs";
import {BUTTON_COLOR} from "../../../../enums/styling.ts";

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
        const service = OperationService.getInstance();

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
            width: 120,
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
            accessor: "actions",
            title: "Actions",
            width: 120,
            render: ({ id }: Categories) => {
                return (
                    <Group>
                        <ActionIcon
                            color={BUTTON_COLOR.PRIMARY}
                            onClick={() => handleDelete(id)}
                            size={"lg"}>
                            <IconTrash />
                        </ActionIcon>
                        <ActionIcon color={BUTTON_COLOR.PRIMARY} size={"lg"} onClick={() => handleEdit(id)}>
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
                const service = OperationService.getInstance();
                const result = await service.deleteById(DatabaseTables.Categories, id);
                if(result.length > 0) {
                    NotificationsService.error("Delete Result", result)
                } else {
                    NotificationsService.success(
                        "Delete Result",
                        "Deleted successfully!",
                    );
                }
            } catch (e: any) {
                NotificationsService.error("Delete Category", e.toString());
            }
            await fetchCategories();
        });
    }

    function handleEdit(id: number) {
        const matching = categories.find((c: Categories) => c.id === id);
        if (matching) {
            setSelectedCategory(matching);
            setOpenCategoryModal(true);
        }
    }

    async function clearSearch(){
        setKeyword("")
        const temp = localStorage.getItem(DatabaseTables.Categories);
        if(!temp) {
            setCategories([])
        } else {
            setCategories(JSON.parse(temp));
        }
    }

    async function handleSearchByName(e: ChangeEvent<HTMLInputElement>) {
        setKeyword(e.target.value)

        const temp = localStorage.getItem(DatabaseTables.Categories);
        let cache = []
        if(!temp) {
            localStorage.setItem(DatabaseTables.Categories, JSON.stringify(categories));
            cache = JSON.parse(JSON.stringify(categories));
        } else {
            cache = JSON.parse(temp);
        }

        const matchingItems = cache.filter((i: any) => i.name.startsWith(e.target.value));
        setCategories(matchingItems)
    }

    return (
        <>
            <Stack pt={"lg"} pl={"sm"}>
                <LoadingOverlay
                    visible={isLoading}
                    overlayProps={{ radius: "sm", blur: 2 }}
                />
                <Stack gap={0}>
                    <Text>Management</Text>
                    <Title>Categories Data</Title>
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
                                onClick={() => setOpenCategoryModal(true)}
                                leftSection={<IconPlus />}>
                                Add
                            </Button>
                            <Button
                                color={BUTTON_COLOR.PRIMARY}
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
