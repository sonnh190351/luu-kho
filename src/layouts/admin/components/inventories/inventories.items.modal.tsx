import {
    Modal,
    LoadingOverlay,
    Stack,
    Text,
    Group,
    ActionIcon,
    Button,
    Divider,
    TextInput,
    Select,
    useMantineColorScheme,
    NumberInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import type { InventoryTicket } from "../../../../models/inventory_ticket";
import type { Inventories } from "../../../../models/inventories";
import {
    BORDER_COLOR_DARK,
    BORDER_COLOR_LIGHT,
    ZIndexLevel,
} from "../../../../enums/styling";
import { NotificationsService } from "../../../../services/notifications/notifications.service.ts";
import InventoryService from "../../../../services/operations/inventory.service.ts";
import CommonTable from "../../../../components/dataTable/common.table.tsx";
import dayjs from "dayjs";
import {
    DatabaseTables,
    DISPLAY_TIME_FORMAT,
} from "../../../../enums/tables.ts";
import {
    IconTrash,
    IconEdit,
    IconRefresh,
    IconSearch, IconDeviceFloppy, IconX,
} from "@tabler/icons-react";
import { InformationService } from "../../../../services/notifications/information.service.ts";
import { useForm } from "@mantine/form";
import { DateTimePicker } from "@mantine/dates";

interface InventoryTicketsModalProps {
    inventory: Inventories | null;
    open: boolean;
    close: any;
}

interface ItemFormValues {
    quantity: number;
    expired_at: string;
    item_id: number;
}

export default function InventoryTicketsModal({
    inventory,
    open = false,
    close,
}: InventoryTicketsModalProps) {
    if (!inventory) return;

    const { colorScheme } = useMantineColorScheme();

    const isDarkMode = colorScheme === "dark";

    const [isLoading, setLoading] = useState(true);

    const [keyword, setKeyword] = useState<string>("");

    const [inventoryTickets, setInventoryTickets] = useState<any[]>([]);

    const [items, setItems] = useState<any[]>([]);

    const [selectedItem, setSelectedItem] = useState<any | null>();

    const form = useForm<ItemFormValues>({
        initialValues: {
            quantity: 0,
            item_id: -1,
            expired_at: "",
        },
        validate: {},
    });

    useEffect(() => {
        (async () => await fetchItems())();
    }, []);

    async function fetchItems() {
        try {
            const service = InventoryService.getInstance();
            const data = await service.getAllRows(DatabaseTables.Items);
            setItems(data);
        } catch (e: any) {
            NotificationsService.error("Fetch Items", e.toString());
        }
    }

    const columns: any[] = [
        {
            accessor: "id",
            title: "ID",
            sortable: true,
            render: ({ id }: InventoryTicket) => {
                return (
                    <Group>
                        <Text>{id}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "items.name",
            title: "Name",
            sortable: true,
            render: ({ items }: any) => {
                return <Group>{items.name}</Group>;
            },
        },
        {
            accessor: "quantity",
            title: "Quantity",
            sortable: true,
            render: ({ quantity }: any) => {
                return <Group>{quantity}</Group>;
            },
        },
        {
            accessor: "items.quantity_type",
            title: "Type",
            sortable: true,
            render: ({ items }: any) => {
                return <Group>{items.quantity_type}</Group>;
            },
        },
        {
            accessor: "created_at",
            title: "Created At",
            sortable: true,
            render: ({ created_at }: InventoryTicket) => {
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
            render: ({ updated_at }: InventoryTicket) => {
                return (
                    <Group>
                        {dayjs(updated_at).format(DISPLAY_TIME_FORMAT)}
                    </Group>
                );
            },
        },
        {
            accessor: "expired_at",
            title: "Expired At",
            sortable: true,
            render: ({ expired_at }: InventoryTicket) => {
                return (
                    <Group>
                        {dayjs(expired_at).format(DISPLAY_TIME_FORMAT)}
                    </Group>
                );
            },
        },
        {
            accessor: "id",
            title: "Actions",
            sortable: false,
            width: 105,
            render: ({ id }: InventoryTicket) => {
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

    useEffect(() => {
        (async () => await fetchInventoryTickets())();
    }, []);

    async function fetchInventoryTickets() {
        if (!inventory) return;

        const service = InventoryService.getInstance();

        try {
            const data = await service.getAllMatchingInventoryItem(
                inventory.id,
            );
            setInventoryTickets(data);
        } catch (e: any) {
            NotificationsService.error("Fetch inventory tickets", e.toString());
        }

        setLoading(false);
    }

    function handleDelete(id: number) {
        InformationService.getInstance().confirm(async () => {
            try {
                const service = InventoryService.getInstance();
                await service.deleteById(DatabaseTables.InventoryTickets, id);
                NotificationsService.success(
                    "Delete Item",
                    "Item has been deleted!",
                );
            } catch (e: any) {
                NotificationsService.error("Delete Item", e.toString());
            }
            await fetchInventoryTickets();
        });
    }

    function handleEdit(id: number) {
        const matching = inventoryTickets.find((i) => i.id === id);
        setSelectedItem(matching)
        console.log(matching)

        const matchingItem = items.find((i) => i.name === matching.items.name);

        form.setValues({
            item_id: matchingItem.id,
            quantity: matching.quantity,
            expired_at: matching.expired_at,
        })

    }

    function handleClose() {
        close();

        setTimeout(() => {
            setSelectedItem(null);
        }, 200);
    }

    function handleSubmit() {

    }

    function clearSelectedItem(){
        setSelectedItem(null);
        form.reset()
        form.setValues({
            item_id: -1
        })
    }

    return (
        <Modal
            title={`Inventory (${inventory.id}) Items Management`}
            pos="relative"
            centered={true}
            opened={open}
            onClose={handleClose}
            size={"50dvw"}
            style={{
                zIndex: ZIndexLevel.MEDIUM,
            }}>
            <Stack
                gap={0}
                style={{
                    minHeight: "400px",
                    borderRight: `1px solid ${isDarkMode ? BORDER_COLOR_DARK : BORDER_COLOR_LIGHT}`,
                    paddingRight: "15px",
                }}>
                <LoadingOverlay
                    visible={isLoading}
                    overlayProps={{ radius: "sm", blur: 2 }}
                />

                <Stack gap={0}>
                    <Text>Controls</Text>
                    <Group justify={"space-between"}>
                        <Group>
                            <Select
                                clearable
                                value={String(form.values.item_id)}
                                onChange={(value) => {
                                    if (value) {
                                        form.setValues({
                                            item_id: Number(value),
                                        });
                                    }
                                }}
                                required
                                searchable
                                label={"Item"}
                                data={items.map((s) => {
                                    return {
                                        label: s.name!,
                                        value: String(s.id),
                                    };
                                })}
                            />
                            <NumberInput
                                required
                                label={`Quantity`}
                                value={form.values.quantity}
                                onChange={(e) => {
                                    if (e) {
                                        form.setValues({
                                            quantity: Number(e),
                                        });
                                    }
                                }}
                            />

                            <DateTimePicker
                                label={"Expiration Date"}
                                required={true}
                                valueFormat="YYYY-MM-DD hh:mm A"
                                value={
                                    form.values.expired_at
                                        ? new Date(form.values.expired_at)
                                        : new Date()
                                }
                                onChange={(e) => {
                                    if (e) {
                                        form.setValues({
                                            expired_at:
                                                dayjs(e).format(
                                                    "YYYY-MM-DD hh:mm A",
                                                ),
                                        });
                                    }
                                }}
                            />
                        </Group>
                        <Group>
                            {
                                Boolean(selectedItem) && <Button onClick={clearSelectedItem} type="submit" mt="23" leftSection={<IconX />} color={"red"}>
                                    Clear
                                </Button>
                            }
                            <Button onClick={handleSubmit} type="submit" mt="23" leftSection={<IconDeviceFloppy />}>
                                Save
                            </Button>
                        </Group>
                    </Group>
                </Stack>
                <Divider mt={"md"} mb={"sm"} />
                <Group justify={"space-between"} mb={"md"}>
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
                        <Text
                            style={{
                                opacity: 0,
                            }}>
                            Controls
                        </Text>
                        <Group>
                            <Button
                                onClick={() => fetchInventoryTickets()}
                                leftSection={<IconRefresh />}>
                                Refresh
                            </Button>
                        </Group>
                    </Stack>
                </Group>

                <CommonTable
                    height="60vh"
                    data={inventoryTickets}
                    columns={columns}
                />
            </Stack>
        </Modal>
    );
}
