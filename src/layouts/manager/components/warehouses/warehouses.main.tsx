import {
    ActionIcon, Button,
    Card,
    Divider, Grid,
    Group,
    LoadingOverlay, type MantineStyleProp,
    Select,
    Stack, Text,
    TextInput,
    Title
} from "@mantine/core";
import {LocalStorage} from "../../../../enums/localStorage.ts";
import {useEffect, useState} from "react";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import {IconPlus, IconRefresh, IconSearch} from "@tabler/icons-react";
import WarehouseItemModal from "./warehouseItem.modal.tsx";
import dayjs from "dayjs";
import {DISPLAY_DATE_FORMAT} from "../../../../enums/tables.ts";
import ExportInventoryModal from "../../../../components/modals/export.modal.tsx";
import OperationService from "../../../../services/operations/operationService.ts";

const cardStyle: MantineStyleProp = {
    height: '150px',
    position: 'relative',
}

export default function ManagerWarehousesTab() {

    const cachedData = localStorage.getItem(LocalStorage.userData);

    const loginData = JSON.parse(cachedData!);

    const warehouse_id = loginData.warehouses.id;

    const [items, setItems] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    const [openModal, setOpenModal] = useState(false);

    const [openExportModal, setOpenExportModal] = useState(false);

    const [selectedItem, setSelectedItem] = useState<any>(null);

    useEffect(() => {
        console.log(selectedItem);
        (async () => await fetchItems())();
    }, []);

    async function fetchItems() {
        setIsLoading(true)
        try {
            console.log("Fetch Items");
            if(warehouse_id !== null) {
                const service = OperationService.getInstance();
                const data = await service.getWarehouseInventoryItems(warehouse_id)
                setItems(data);
                console.log(data)
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

    function handleCloseExportModal() {
        setOpenExportModal(false);
        setTimeout(() => {
            setSelectedItem(null);
        }, 200)
    }

    function handleSelectItem(item: any) {
        setSelectedItem(item);
        setOpenExportModal(true);
    }

    return (
        <>
            <Stack pt={"lg"} pl={"sm"}>
                <LoadingOverlay
                    visible={isLoading}
                    overlayProps={{radius: "sm", blur: 2}}
                />
                <Title>Warehouse Inventory</Title>
                <Grid>
                    <Grid.Col span={4}>
                        <Card style={{
                            ...cardStyle
                        }}>
                            <Stack justify={'flex-end'} align={'start'}>
                                <Text>Total Items</Text>
                                <Title>1</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <Card style={{
                            ...cardStyle
                        }}>
                            <Stack justify={'flex-end'} align={'start'}>
                                <Text>Expiring Soon</Text>
                                <Title>1</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <Card style={{
                            ...cardStyle
                        }}>
                            <Stack justify={'flex-end'} align={'start'}>
                                <Text>Out of stock</Text>
                                <Title>1</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                </Grid>
                <Group justify={'space-between'}>
                    <Group>
                        <TextInput label={"Name"} leftSection={<IconSearch />} />
                        <Select label={"Warehouse"}></Select>
                        <Select label={"Category"}></Select>
                        <Select label={"Status"}></Select>
                    </Group>
                    <Stack gap={2}>
                        <Text style={{
                            fontSize: 14
                        }}>Controls</Text>
                        <Group>
                            <Button
                                onClick={() => setOpenModal(true)}
                                leftSection={<IconPlus/>}>
                                Add
                            </Button>
                            <Button
                                onClick={() => fetchItems()}
                                leftSection={<IconRefresh/>}>
                                Refresh
                            </Button>
                        </Group>
                    </Stack>
                </Group>
                <Divider />
                <Stack>
                    <Group justify={"space-between"}>
                        <Group style={{
                            width: "90%",
                        }}>
                            <Grid style={{
                                width: "100%",
                            }}>
                                <Grid.Col span={3}>
                                    <Title ml={'sm'} order={4}>Name</Title>
                                </Grid.Col>
                                <Grid.Col span={3}>
                                    <Title ml={5} order={4}>Remaining Quantity</Title>
                                </Grid.Col>
                                <Grid.Col span={3}>
                                    <Title ml={0} order={4}>Import Date</Title>
                                </Grid.Col>
                                <Grid.Col span={3}>
                                    <Title ml={-5} order={4}>Expired Date</Title>
                                </Grid.Col>
                            </Grid>
                        </Group>
                        <Title mr={16} order={4}>Action</Title>
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
                                            <Grid.Col span={3}>
                                                {item.items.name}
                                            </Grid.Col>
                                            <Grid.Col span={3}>
                                                {item.quantity} ({item.items.quantity_type})
                                            </Grid.Col>
                                            <Grid.Col span={3}>
                                                {dayjs(item.created_at).format(DISPLAY_DATE_FORMAT)}
                                            </Grid.Col>
                                            <Grid.Col span={3}>
                                                {dayjs(item.expired_at).format(DISPLAY_DATE_FORMAT)}
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

            <WarehouseItemModal open={openModal} close={handleCloseModal} refresh={fetchItems} />

            <ExportInventoryModal open={openExportModal} refresh={fetchItems} close={handleCloseExportModal} />
        </>
    )
}