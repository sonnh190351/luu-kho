import {
    ActionIcon,
    Card,
    Divider, Grid,
    Group,
    LoadingOverlay, Modal, MultiSelect,
    NumberInput,
    Select,
    Stack,
    TextInput,
    Title
} from "@mantine/core";
import {LocalStorage} from "../../../../enums/localStorage.ts";
import {useEffect, useState} from "react";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import ManagementService from "../../../../services/operations/management.service.ts";
import {IconPlus, IconSearch} from "@tabler/icons-react";
import WarehouseItemModal from "./warehouseItem.modal.tsx";

export default function StaffWarehousesTab() {

    const cachedData = localStorage.getItem(LocalStorage.userData);

    const loginData = JSON.parse(cachedData!);

    const warehouse_id = loginData.warehouse_id;

    const [items, setItems] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    const [openModal, setOpenModal] = useState(false);

    const [selectedItem, setSelectedItem] = useState<any>(null);

    useEffect(() => {
        (async () => await fetchItems())();
    }, []);

    async function fetchItems() {
        setIsLoading(true)
        try {
            console.log("Fetch Items");
            if(warehouse_id !== null) {
                const service = ManagementService.getInstance();
                const data = await service.getWarehouseInventoryItems(warehouse_id)
                setItems(data);
            }
        } catch (e: any) {
            NotificationsService.error("Fetch Items", e.toString());
        }
        setIsLoading(false)
    }

    function handleCloseModal() {
        setOpenModal(false);
        setTimeout(() => {
            setSelectedItem(null);
        }, 200)
    }

    function handleSelectItem(item: any) {
        setSelectedItem(item);
        setOpenModal(true);
    }

    return (
        <>
            <Stack pt={"lg"} pl={"sm"}>
                <LoadingOverlay
                    visible={isLoading}
                    overlayProps={{radius: "sm", blur: 2}}
                />

                <Title>Warehouse Inventory</Title>
                <Group>
                    <TextInput label={"Name"} leftSection={<IconSearch />} />
                    <Select label={"Warehouse"}></Select>
                    <Select label={"Category"}></Select>
                    <MultiSelect label={"Tag"} style={{
                        width: "200px",
                    }}></MultiSelect>
                    <NumberInput label={"Leftover Quantity"} />
                </Group>
                <Divider />
                <Stack>
                    <Group style={{
                        width: "90%",
                    }}>
                        <Grid style={{
                            width: "100%",
                        }}>
                            <Grid.Col span={4}>
                                <Title ml={'sm'} order={4}>Name</Title>
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Title ml={5} order={4}>Quantity</Title>
                            </Grid.Col>
                        </Grid>
                    </Group>

                    {
                        items.map((item: any, index: number) => (
                            <Card key={`warehouse-item-${index}`}>
                                <Group justify={"space-between"}>
                                    <Group style={{
                                        width: "90%",
                                    }}>
                                        <Grid style={{
                                            width: "100%",
                                        }}>
                                            <Grid.Col span={4}>
                                                {item.items.name}
                                            </Grid.Col>
                                            <Grid.Col span={4}>
                                                {item.quantity}
                                            </Grid.Col>
                                        </Grid>
                                    </Group>
                                    <Group>
                                        <ActionIcon onClick={() => handleSelectItem(item)}>
                                            <IconPlus />
                                        </ActionIcon>
                                    </Group>
                                </Group>
                            </Card>
                        ))
                    }
                </Stack>
            </Stack>

            <WarehouseItemModal open={openModal} close={handleCloseModal} item={selectedItem} refresh={fetchItems} />
        </>
    )
}