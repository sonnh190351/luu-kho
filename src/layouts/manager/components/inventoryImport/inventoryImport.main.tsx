import {
    Button,
    Card,
    Divider,
    Grid,
    Group,
    LoadingOverlay,
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
import WarehouseItemModal from "./inventoryImport.modal.tsx";
import dayjs from "dayjs";
import {DatabaseTables, DISPLAY_TIME_FORMAT} from "../../../../enums/tables.ts";
import ExportInventoryModal from "../../../../components/modals/export.modal.tsx";
import OperationService from "../../../../services/operations/operationService.ts";
import {BUTTON_COLOR} from "../../../../enums/styling.ts";
import {useForm} from "@mantine/form";
import CommonTable from "../../../../components/dataTable/common.table.tsx";
import type {DataTableColumn, DataTableRowExpansionProps} from "mantine-datatable";


interface SortFormValues {
    name: string;
    category: string;
    status: string;
}

export default function ManagerInventoryImportTab() {

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
    const [rootData, setRootData] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    const [openModal, setOpenModal] = useState(false);

    const [openExportModal, setOpenExportModal] = useState(false);

    const [isSorting, setSorting] = useState<boolean>(false)

    const [categories, setCategories] = useState<any[]>([])

    useEffect(() => {
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
                const data = await service.getWarehouseInventoriesImportItems(warehouse_id)
                mappingData(data)
                setRootData(data)
            }
        } catch (e: any) {
            NotificationsService.error("Fetch Items", e.toString());
        }
        setIsLoading(false)
    }

    function mappingData(data: any[]) {
        const items: Record<string, any> = {}
        for(let i = 0; i < data.length; i++) {
            const item = JSON.parse(JSON.stringify(data[i]));
            if(!items[item.items.name]) {
                items[item.items.name] = item;
            } else {
                items[item.items.name].quantity += item.quantity;
            }
        }

        setItems(Object.values(items));
    }

    function handleCloseModal() {
        setOpenModal(false);
    }

    function handleCloseExportModal() {
        setOpenExportModal(false);
    }


    function handleSort() {
        setSorting(true)
    }

    function handleClearSort() {
        form.reset();
        setSorting(false)
    }

    const columns: DataTableColumn[] = [
        {
            accessor: "id",
            title: "ID",
            width: 170,
            sortable: true,
            render: ({ id }: any) => {
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
            render: ({ items }: any) => {
                return (
                    <Group>
                        <Text>{items.name}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "supplier",
            title: "Supplier",
            sortable: true,
            render: ({ suppliers }: any) => {
                return (
                    <Group>
                        <Text>{suppliers && suppliers.name}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "quantity",
            title: "Quantity",
            sortable: true,
            width: 200,
            render: ({ quantity }: any) => {
                return (
                    <Group>
                        <Text>{quantity}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "quantity_type",
            title: "Quantity Type",
            width: 200,
            render: ({ items }: any) => {
                return (
                    <Group>
                        <Text>{items.quantity_type}</Text>
                    </Group>
                );
            },
        },
    ]

    const rowExpansion: DataTableRowExpansionProps = {
        content: ({ record }: any) => {
            const data = rootData.filter((r) => r.items.name === record.items.name)
            return <Stack gap={6} pb={'md'}>
                <Group>
                    <Text style={{width: 70}}>Index</Text>
                    <Text style={{width: 100}}>Quantity</Text>
                    <Text style={{width: 200}}>Quantity Type</Text>
                    <Text style={{width: 200}}>Import Date</Text>
                </Group>
                <Divider />
                {
                    data.map((item: any, index: number) => <Group key={`record-${item.items.name}-${index}`}>
                        <Text style={{width: 70}}>{index + 1}</Text>
                        <Text style={{width: 100}}>{item.quantity}</Text>
                        <Text style={{width: 200}}>{item.items.quantity_type}</Text>
                        <Text style={{width: 200}}>{dayjs(item.created_at).format(DISPLAY_TIME_FORMAT)}</Text>
                    </Group>)
                }
            </Stack>
        }
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
                    <Title>Warehouse Inventories Import Ticket</Title>
                </Stack>
                <Divider/>
                <Grid>
                    <Grid.Col span={{base: 6, md: 3}}>
                        <Card withBorder={true}>
                            <Stack justify={'flex-end'} align={'start'}>
                                <Group gap={5}>
                                    <IconBox/>
                                    <Text>Total Items</Text>
                                </Group>
                                <Title order={2}>{items.length}</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{base: 6, md: 3}}>
                        <Card withBorder={true}>
                            <Stack justify={'flex-end'} align={'start'}>
                                <Group gap={5}>
                                    <IconBox/>
                                    <Text>Expiring Soon</Text>
                                </Group>
                                <Title order={2}>{
                                    items.filter((i) => dayjs(i.expired_at).unix() - dayjs().unix() > 0).length
                                }</Title>
                            </Stack>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{base: 6, md: 3}}>
                        <Card withBorder={true}>
                            <Stack justify={'flex-end'} align={'start'}>
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
                        <Card withBorder={true}>
                            <Stack justify={'flex-end'} align={'start'}>
                                <Group gap={5}>
                                    <IconBox/>
                                    <Text>Out of stock</Text>
                                </Group>
                                <Title order={2}>{
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
                        <Button color={BUTTON_COLOR.PRIMARY} mt={25} onClick={handleSort} leftSection={<IconFilter/>}>Sort</Button>
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

                <CommonTable rowExpansion={rowExpansion} height={'56dvh'} data={items} columns={columns} />
            </Stack>

            <WarehouseItemModal open={openModal} close={handleCloseModal} refresh={fetchItems} />

            <ExportInventoryModal open={openExportModal} refresh={fetchItems} close={handleCloseExportModal} />
        </>
    )
}