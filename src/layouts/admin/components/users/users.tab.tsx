import {
    ActionIcon,
    Badge,
    Button,
    Group,
    Stack,
    Text,
    TextInput,
    LoadingOverlay,
    Title, Divider,
} from "@mantine/core";
import {
    IconEdit,
    IconPlus,
    IconRefresh,
    IconSearch,
    IconTrash, IconX,
} from "@tabler/icons-react";
import {type ChangeEvent, useEffect, useState} from "react";

import CommonTable from "../../../../components/dataTable/common.table.tsx";
import OperationService from "../../../../services/operations/operationService.ts";
import UserDetailsModal from "./users.modal.tsx";
import {
    DatabaseTables,
    DISPLAY_TIME_FORMAT,
} from "../../../../enums/tables.ts";
import type {UserDetails} from "../../../../models/user.ts";
import {InformationService} from "../../../../services/notifications/information.service.ts";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import UtilsService from "../../../../services/utils.ts";
import dayjs from "dayjs";
import {BUTTON_COLOR} from "../../../../enums/styling.ts";

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
        const service = OperationService.getInstance();

        try {
            const data = await service.getAllUsers()
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
            render: ({id}: UserDetails) => {
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
            render: ({email}: UserDetails) => {
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
            render: ({first_name}: UserDetails) => {
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
            render: ({last_name}: UserDetails) => {
                return (
                    <Group>
                        <Text>{last_name}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "avatar",
            title: "Avatar",
            render: ({avatar}: UserDetails) => {
                return (
                    <Group justify={'center'} style={{
                        textAlign: "center"
                    }}>
                        {
                            avatar ?
                                <img alt={"avatar"} width={100} src={UtilsService.getAvatarUrl(avatar!)}/> :
                                <Text>No Avatar Available</Text>
                        }
                    </Group>
                );
            },
        },
        {
            accessor: "dob",
            title: "Date Of Birth",
            sortable: true,
            render: ({dob}: UserDetails) => {
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
            render: ({role}: UserDetails) => {
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
            render: ({warehouses}: UserDetails) => {
                return (
                    <Group>
                        {warehouses ? (
                            <Text>{
                                warehouses.name
                            }</Text>
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
            render: ({created_at}: UserDetails) => {
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
            render: ({updated_at}: UserDetails) => {
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
            width: 130,
            render: ({status}: UserDetails) => {
                return (
                    <Group justify={'center'}>
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
            accessor: "actions",
            title: "Actions",
            width: 120,
            render: ({id}: UserDetails) => {
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
                const result = await service.deleteById(DatabaseTables.UserDetails, id);
                if (result.length > 0) {
                    NotificationsService.error("Delete Result", result)
                } else {
                    NotificationsService.success(
                        "Delete Result",
                        "Deleted successfully!",
                    );
                }
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

    async function clearSearch() {
        setKeyword("")
        const temp = localStorage.getItem(DatabaseTables.UserDetails);
        if (!temp) {
            setUserDetails([])
        } else {
            setUserDetails(JSON.parse(temp));
        }
    }

    async function handleSearchByEmail(e: ChangeEvent<HTMLInputElement>) {
        setKeyword(e.target.value)

        const temp = localStorage.getItem(DatabaseTables.UserDetails);
        let cache = []
        if (!temp) {
            localStorage.setItem(DatabaseTables.UserDetails, JSON.stringify(items));
            cache = JSON.parse(JSON.stringify(items));
        } else {
            cache = JSON.parse(temp);
        }

        const matchingItems = cache.filter((i: any) => i.email.startsWith(e.target.value));
        setUserDetails(matchingItems)
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
                    <Title>Users Data</Title>
                </Stack>
                <Divider/>

                <Group justify={"space-between"}>
                    <Stack gap={5}>
                        <Text>Filter</Text>
                        <Group>
                            <TextInput
                                placeholder={"Search by Email"}
                                value={keyword}
                                onChange={handleSearchByEmail}
                            />
                            {
                                keyword.length > 0 && <ActionIcon onClick={clearSearch} size={"lg"} color={'red'}>
                                    <IconX/>
                                </ActionIcon>
                            }
                            <ActionIcon color={BUTTON_COLOR.PRIMARY} size={"lg"}>
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
                                onClick={fetchUserDetails}
                                leftSection={<IconRefresh/>}>
                                Refresh
                            </Button>
                        </Group>
                    </Stack>
                </Group>

                <CommonTable data={items} columns={columns}/>
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
