import {
    ActionIcon,
    Badge,
    Button,
    Chip,
    Divider,
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
    IconTrash,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import CommonTable from "../../../../components/dataTable/common.table.tsx";
import InventoryService from "../../../../services/operations/inventory.service.ts";
import UserDetailsModal from "./users.modal.tsx";
import {
    DatabaseTables,
    DISPLAY_TIME_FORMAT,
} from "../../../../enums/tables.ts";
import type { UserDetails } from "../../../../models/user.ts";
import { InformationService } from "../../../../services/notifications/information.service.ts";
import { NotificationsService } from "../../../../services/notifications/notifications.service.ts";
import UtilsService from "../../../../services/utils.ts";
import dayjs from "dayjs";

export default function UserDetailsTab() {
    const [isLoading, setLoading] = useState(true);

    const [items, setUserDetails] = useState<any[]>([]);

    const [keyword, setKeyword] = useState<string>("");

    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [openItemModal, setOpenItemModal] = useState<boolean>(false);

    useEffect(() => {
        (async () => await fetchUserDetails())();
    }, []);

    async function fetchUserDetails() {
        const service = InventoryService.getInstance();

        try {
            const data = await service.getAllRows(DatabaseTables.UserDetails);
            setUserDetails(data);
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
            render: ({ id }: UserDetails) => {
                return (
                    <Group>
                        <Text>{id}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "email",
            title: "Email",
            sortable: true,
            render: ({ email }: UserDetails) => {
                return (
                    <Group>
                        <Text>{email}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "first_name",
            title: "First Name",
            sortable: true,
            render: ({ first_name }: UserDetails) => {
                return (
                    <Group>
                        <Text>{first_name}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "last_name",
            title: "Last Name",
            sortable: true,
            render: ({ last_name }: UserDetails) => {
                return (
                    <Group>
                        <Text>{last_name}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "dob",
            title: "Date Of Birth",
            sortable: true,
            render: ({ dob }: UserDetails) => {
                return (
                    <Group>
                        <Text>{dob}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "role",
            title: "Role",
            sortable: true,
            render: ({ role }: UserDetails) => {
                return (
                    <Group>
                        <Text>{UtilsService.getRoleLevel(role)}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "warehouse_id",
            title: "Warehouse",
            sortable: true,
            width: 175,
            render: ({ warehouse_id }: UserDetails) => {
                return (
                    <Group>
                        {warehouse_id ? (
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
                        ) : (
                            <Text>N/A</Text>
                        )}
                    </Group>
                );
            },
        },
        {
            accessor: "created_at",
            title: "Created At",
            sortable: true,
            render: ({ created_at }: UserDetails) => {
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
            render: ({ updated_at }: UserDetails) => {
                return (
                    <Group>
                        {dayjs(updated_at).format(DISPLAY_TIME_FORMAT)}
                    </Group>
                );
            },
        },
        {
            accessor: "status",
            title: "Status",
            sortable: true,
            render: ({ status }: UserDetails) => {
                return (
                    <Group>
                        {status ? (
                            <Badge color="green">Activated</Badge>
                        ) : (
                            <Badge color="red">Deactivated</Badge>
                        )}
                    </Group>
                );
            },
        },
        {
            accessor: "id",
            title: "Actions",
            sortable: true,
            width: 120,
            render: ({ id }: UserDetails) => {
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
                await service.deleteById(DatabaseTables.Users, id);
                NotificationsService.success(
                    "Deactivate User",
                    "User has been deactivated!",
                );
            } catch (e: any) {
                NotificationsService.error("Deactivate User", e.toString());
            }
            await fetchUserDetails();
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

                <Title>Users Management</Title>

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
                                onClick={() => setOpenItemModal(true)}
                                leftSection={<IconPlus />}>
                                Add
                            </Button>
                            <Button
                                onClick={fetchUserDetails}
                                leftSection={<IconRefresh />}>
                                Refresh
                            </Button>
                        </Group>
                    </Stack>
                </Group>

                <CommonTable data={items} columns={columns} />
            </Stack>

            {/*Item modal*/}
            <UserDetailsModal
                user={selectedItem}
                open={openItemModal}
                refresh={fetchUserDetails}
                close={handleCloseItemModal}
            />
        </>
    );
}
