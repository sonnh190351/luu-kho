import {Card, Divider, Grid, Group, Stack, Text, Title} from "@mantine/core";
import {useEffect, useState} from "react";
import {LocalStorage} from "../../../../enums/localStorage.ts";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import OperationService from "../../../../services/operations/operationService.ts";
import {DatabaseTables} from "../../../../enums/tables.ts";
import {IconBox, IconBuildingWarehouse, IconChartArea, IconMenuOrder, IconUser} from "@tabler/icons-react";
import dayjs from "dayjs";
import CategoryChart from "../../../../components/charts/category.chart.tsx";
import ItemsChart from "../../../../components/charts/items.chart.tsx";
import SalesChart from "../../../../components/charts/sales.chart.tsx";

export default function AdminDashboardTab() {

    const cacheData = JSON.parse(localStorage.getItem(LocalStorage.userData)!);

    // Sales data
    const [salesData, setSalesData] = useState<any[]>([]);

    // Categories data
    const [categoriesData, setCategoriesData] = useState<any[]>([]);

    // Items data
    const [itemsData, setItemsData] = useState<any[]>([]);

    const [users, setUsers] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);

    useEffect(() => {
        (async () => await fetchDashboardData())();
    }, []);

    async function fetchDashboardData() {
        try {
            const service = OperationService.getInstance();

            // Create sales data
            const orders = await service.getAllWarehousesOrders()
            updateSalesChart(orders)

            // Create inventory data
            const inventoryItems = await service.getAllInventoriesImportItems()
            const categories = await service.getAllRows(DatabaseTables.Categories)
            updateInventoryStatusChart(inventoryItems, categories)

            // Create overall data
            const users = await service.getAllRows(DatabaseTables.UserDetails)
            const warehouses = await service.getAllRows(DatabaseTables.Warehouses)
            updateOverallChart(users, warehouses)

        } catch (e: any) {
            NotificationsService.error("Fetch dashboard data", e.toString());
        }
    }

    function updateSalesChart(orders: any[]) {
        let orderData: any[] = [
            {
                name: dayjs().format("YYYY-MM-DD"),
                total: 0
            }
        ]

        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const date = dayjs(order.created_at).format('YYYY-MM-DD')
            const matching = orderData.find((d) => d.name === date)
            if (matching) {
                matching.total += order.quantity
            } else {
                orderData.push({
                    name: date,
                    total: order.quantity
                })
            }
        }

        // Sort data
        orderData = orderData.sort((a, b) => dayjs(a.name).unix() - dayjs(b.name).unix())

        setSalesData(orderData)
    }

    function updateInventoryStatusChart(inventoryItems: any[], categories: any[]) {
        setInventoryItems(inventoryItems)

        const categoriesData: any[] = []
        const itemsData: any[] = []

        for (let i = 0; i < categories.length; i++) {
            categoriesData.push({
                name: categories[i].name, total: 0, id: categories[i].id,
            })
        }

        for (let i = 0; i < inventoryItems.length; i++) {
            const item = inventoryItems[i]
            const matching = categoriesData.find((d) => d.id === item.items.category_id)
            if (matching) {
                matching.total += item.quantity
            }

            const matchingItem = itemsData.find((d) => d.name === item.items.name)
            if(!matchingItem) {
                itemsData.push({
                    name: item.items.name,
                    quantity: item.quantity,
                })
            } else {
                matchingItem.quantity += item.quantity
            }
        }

        setCategoriesData(categoriesData)
        setItemsData(itemsData)
    }


    function updateOverallChart(users: any[], warehouses: any[]) {
        setUsers(users);
        setWarehouses(warehouses);
    }

    return (
        <Stack pt={"lg"} pl={"sm"}>
            <Stack gap={0}>
                <Title>Welcome back, {cacheData.first_name}</Title>
                <Text style={{
                    color: 'rgba(255,255,255,0.45)'
                }}>Manage all warehouses inventory items with ease</Text>
            </Stack>
            <Divider/>

            <Grid>
                <Grid.Col span={{base: 6, md: 4}}>
                    <Card withBorder={true}>
                        <Stack gap={10}>
                            <Group gap={5}>
                                <IconUser/>
                                <Text>Total Users</Text>
                            </Group>
                            <Title order={2}>{users.length}</Title>
                        </Stack>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{base: 6, md: 4}}>
                    <Card withBorder={true}>
                        <Stack gap={10}>
                            <Group gap={5}>
                                <IconBuildingWarehouse/>
                                <Text>Warehouses</Text>
                            </Group>
                            <Title order={2}>{warehouses.length}</Title>
                        </Stack>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{base: 6, md: 4}}>
                    <Card withBorder={true}>
                        <Stack gap={10}>
                            <Group gap={5}>
                                <IconMenuOrder/>
                                <Text>Total Orders</Text>
                            </Group>
                            <Title order={2}>{warehouses.length}</Title>
                        </Stack>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{base: 12}}>
                    <Card withBorder={true}>
                        <SalesChart chartData={salesData} />
                    </Card>
                </Grid.Col>
                <Grid.Col span={{base: 6, md: 3}}>
                    <Card withBorder={true}>
                        <Stack gap={10}>
                            <Group gap={5}>
                                <IconBox/>
                                <Text>All Warehouses Items</Text>
                            </Group>
                            <Title order={2}>{inventoryItems.length}</Title>
                        </Stack>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{base: 6, md: 3}}>
                    <Card withBorder={true}>
                        <Stack gap={10}>
                            <Group gap={5}>
                                <IconBox/>
                                <Text>Expiring Items</Text>
                            </Group>
                            <Title order={2}>{
                                inventoryItems.filter((i) => dayjs(i.expired_at).unix() - dayjs().unix() > 0).length
                            }</Title>
                        </Stack>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{base: 6, md: 3}}>
                    <Card withBorder={true}>
                        <Stack gap={10}>
                            <Group gap={5}>
                                <IconBox/>
                                <Text>Warning Limit Items</Text>
                            </Group>
                            <Title order={2}>{
                                inventoryItems.filter((i) => i.quantity < i.items.warning_limit).length
                            }</Title>
                        </Stack>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{base: 6, md: 3}}>
                    <Card withBorder={true}>
                        <Stack gap={10}>
                            <Group gap={5}>
                                <IconBox/>
                                <Text>Out of stock Items</Text>
                            </Group>
                            <Title order={2}>{
                                inventoryItems.filter((i) => i.quantity === 0).length
                            }</Title>
                        </Stack>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{base: 12, md: 6}}>
                    <Card withBorder={true}>
                        <Group mb={'sm'} gap={5}>
                            <IconChartArea/>
                            <Text>
                                Items in All Warehouse Inventories
                            </Text>
                        </Group>
                        <CategoryChart chartData={categoriesData} />
                    </Card>
                </Grid.Col>
                <Grid.Col span={{base: 12, md: 6}}>
                    <Card withBorder={true}>
                        <Group mb={'sm'} gap={5}>
                            <IconChartArea/>
                            <Text>
                                Most Stored Items
                            </Text>
                        </Group>
                        <ItemsChart chartData={itemsData} />
                    </Card>
                </Grid.Col>
            </Grid>
        </Stack>
    )
}