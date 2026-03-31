import {
    ActionIcon,
    Button,
    Card,
    Divider,
    Grid,
    Group,
    LoadingOverlay,
    type MantineStyleProp,
    Select,
    Stack,
    Text,
    TextInput,
    Title
} from "@mantine/core";
import {LocalStorage} from "../../../../enums/localStorage.ts";
import {useEffect, useState} from "react";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import {IconBox, IconFilter, IconPlus, IconRefresh, IconSearch, IconX} from "@tabler/icons-react";
import WarehouseItemModal from "./warehouseItem.modal.tsx";
import dayjs from "dayjs";
import {DatabaseTables, DISPLAY_DATE_FORMAT} from "../../../../enums/tables.ts";
import ExportInventoryModal from "../../../../components/modals/export.modal.tsx";
import OperationService from "../../../../services/operations/operationService.ts";
import {BUTTON_COLOR} from "../../../../enums/styling.ts";
import {useForm} from "@mantine/form";

const cardStyle: MantineStyleProp = {
    height: '150px',
    position: 'relative',
}

interface SortFormValues {
    name: string;
    category: string;
    status: string;
}

export default function ManagerWarehousesTab() {

    const form = useForm<SortFormValues>({
        initialValues: {
            name: "",
            category: "-1",
            status: ""
        }
    })

    const cachedData = localStorage.getItem(LocalStorage.userData);

    const loginData = JSON.parse(cachedData!);

    const warehouse_id = loginData.warehouses.id;

    const [items, setItems] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    const [openModal, setOpenModal] = useState(false);

    const [openExportModal, setOpenExportModal] = useState(false);

    const [selectedItem, setSelectedItem] = useState<any>(null);

    const [isSorting, setSorting] = useState<boolean>(false)

    const [categories, setCategories] = useState<any[]>([])

    useEffect(() => {
        console.log(selectedItem);
        (async () => await fetchItems())();
    }, []);

    useEffect(() => {
        (async () => await fetchCategories())();
    }, [])

    async function fetchCategories() {
        try {
            const service = OperationService.getInstance();
            const data = await service.getAllRows(DatabaseTables.Categories)
            setCategories(data);
        } catch (e: any) {
            NotificationsService.error("Fetch Categories", e.toString());
        }
    }


    async function fetchItems() {
        setIsLoading(true)
        try {
            if(warehouse_id !== null) {
                const service = OperationService.getInstance();
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

    function handleSort() {
        setSorting(true)


    }

    function handleClearSort() {
        form.reset();
        setSorting(false)
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
                    <Title>Warehouse Inventories Data</Title>
                </Stack>
                <Divider/>
                <Grid>
                    <Grid.Col span={{base: 6, md: 3}}>
                        <Card style={{
                            ...cardStyle
                        }}>
                            <Stack justify={'flex-end'} align={'start'}>
                                <Text>Total Items</Text>
                                <Title>{items.length}</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{base: 6, md: 3}}>
                        <Card style={{
                            ...cardStyle
                        }}>
                            <Stack justify={'flex-end'} align={'start'}>
                                <Text>Expiring Soon</Text>
                                <Title>{
                                    items.filter((i) => dayjs(i.expired_at).unix() - dayjs().unix() > 0).length
                                }</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{base: 6, md: 3}}>
                        <Card withBorder={true}>
                            <Stack gap={10}>
                                <Group gap={5}>
                                    <IconBox/>
                                    <Text>Warning Limit</Text>
                                </Group>
                                <Title order={2}>{
                                    items.filter((i) => i.quantity < i.items.warning_limit).length
                                }</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{base: 6, md: 3}}>
                        <Card style={{
                            ...cardStyle
                        }}>
                            <Stack justify={'flex-end'} align={'start'}>
                                <Text>Out of stock</Text>
                                <Title>{
                                    items.filter((i) => i.quantity === 0).length
                                }</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                </Grid>
                <Group justify={'space-between'}>
                    <Group>
                        <TextInput {...form.getInputProps("name")} label={"Name"} leftSection={<IconSearch />} />
                        <Select clearable={true} data={categories.map((c: any) => {
                            return {
                                value: String(c.id),
                                label: c.name
                            }
                        })} {...form.getInputProps("category")} label={"Category"}></Select>
                        <Select {...form.getInputProps("status")} label={"Status"}></Select>
                        <Button onClick={handleSort} leftSection={<IconFilter/>}>Sort</Button>
                        {
                            isSorting && <Button onClick={handleClearSort} leftSection={<IconX />}>Clear</Button>
                        }
                    </Group>
                    <Stack gap={2}>
                        <Text style={{
                            fontSize: 14
                        }}>Controls</Text>
                        <Group>
                            <Button
                                color={BUTTON_COLOR.PRIMARY}
                                onClick={() => setOpenModal(true)}
                                leftSection={<IconPlus/>}>
                                Add
                            </Button>
                            <Button
                                color={BUTTON_COLOR.PRIMARY}
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
                                        <ActionIcon color={BUTTON_COLOR.PRIMARY} onClick={() => handleSelectItem(item)}>
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