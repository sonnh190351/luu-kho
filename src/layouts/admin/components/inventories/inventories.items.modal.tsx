import {
    Modal,
    LoadingOverlay,
    Stack,
    Text,
    Group,
    ActionIcon,
} from "@mantine/core";
import { useEffect, useState } from "react";
import type { InventoryTicket } from "../../../../models/inventory_ticket";
import type { Inventories } from "../../../../models/inventories";
import { ZIndexLevel } from "../../../../enums/styling";
import { NotificationsService } from "../../../../services/notifications/notifications.service.ts";
import InventoryService from "../../../../services/operations/inventory.service.ts";
import CommonTable from "../../../../components/dataTable/common.table.tsx";
import dayjs from "dayjs";
import {
    DatabaseTables,
    DISPLAY_TIME_FORMAT,
} from "../../../../enums/tables.ts";
import { IconTrash, IconEdit } from "@tabler/icons-react";
import { InformationService } from "../../../../services/notifications/information.service.ts";
import InventoryTicketItemModal from "./inventories.items.form.modal.tsx";

interface InventoryTicketsModalProps {
    inventory: Inventories | null;
    open: boolean;
    close: any;
}

export default function InventoryTicketsModal({
    inventory,
    open = false,
    close,
}: InventoryTicketsModalProps) {
    if (!inventory) return;

    const [isLoading, setLoading] = useState(true);
    const [items, setItems] = useState<any[]>([]);

    const [selectedItem, setSelectedItem] = useState<any | null>();

    const [openItemModal, setOpenItemModal] = useState<boolean>(false);

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
            setItems(data);
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
        const matching = items.find((i) => i.id === id);
        if (matching) {
            setSelectedItem(matching);
            setOpenItemModal(true);
        }
    }

    function handleClose() {
        close();

        setTimeout(() => {
            setSelectedItem(null);
        }, 200);
    }

    return (
        <Modal
            title={`Inventory (${inventory.id}) Items List`}
            pos="relative"
            centered={true}
            opened={open}
            onClose={handleClose}
            size={"auto"}
            style={{
                zIndex: ZIndexLevel.HIGHEST,
            }}>
            <Stack
                style={{
                    minHeight: "400px",
                }}>
                <LoadingOverlay
                    visible={isLoading}
                    overlayProps={{ radius: "sm", blur: 2 }}
                />
                <CommonTable data={items} columns={columns} />
            </Stack>

            <InventoryTicketItemModal
                item={selectedItem}
                open={openItemModal}
                refresh={fetchInventoryTickets}
                close={handleClose}
            />
        </Modal>
    );
}
