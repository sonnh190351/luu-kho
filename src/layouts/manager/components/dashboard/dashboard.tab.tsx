import {Card, Divider, Grid, Group, Stack, Text, Title} from "@mantine/core";
import {LocalStorage} from "../../../../enums/localStorage.ts";
import {IconBox, IconChartArea} from "@tabler/icons-react";
import dayjs from "dayjs";
import {useEffect, useState} from "react";
import ImportChart from "../../../../components/charts/import.chart.tsx";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import OperationService from "../../../../services/operations/operationService.ts";
import {DatabaseTables} from "../../../../enums/tables.ts";
import CategoryChart from "../../../../components/charts/category.chart.tsx";
import ItemsChart from "../../../../components/charts/items.chart.tsx";

export default function ManagerDashboardTab() {
    const cacheData = JSON.parse(localStorage.getItem(LocalStorage.userData)!);

    const [inventoryItems, setInventoryItems] = useState<any[]>([]);

    const [importData, setImportData] = useState<any[]>([]);

    // Categories data
    const [categoriesData, setCategoriesData] = useState<any[]>([]);

    // Items data
    const [itemsData, setItemsData] = useState<any[]>([]);

    useEffect(() => {
        (async () => await fetchDashboardData())();
    }, []);

    async function fetchDashboardData() {
        try {
            const service = OperationService.getInstance();

            // Create import data
            const imports = await service.getAllMatching(
                DatabaseTables.InventoriesImport,
                "warehouse_id",
                cacheData.warehouses.id,
            );
            updateImportChart(imports);

            //
            const inventoryItems = await service.getWarehouseInventoriesImportItems(
                cacheData.warehouses.id,
            );
            const categories = await service.getAllRows(DatabaseTables.Categories);
            updateInventoryStatusChart(inventoryItems, categories);
        } catch (e: any) {
            NotificationsService.error("Fetch dashboard data", e.toString());
        }
    }

    function updateImportChart(imports: any[]) {
        let importData: any[] = [
            {
                name: dayjs().format("YYYY-MM-DD"),
                total: 0,
            },
        ];

        for (let i = 0; i < imports.length; i++) {
            const inventoryImportData = imports[i];
            const date = dayjs(inventoryImportData.created_at).format("YYYY-MM-DD");
            const matching = importData.find((d) => d.name === date);
            if (matching) {
                matching.total += inventoryImportData.quantity;
            } else {
                importData.push({
                    name: date,
                    total: inventoryImportData.quantity,
                });
            }
        }

        importData = importData.sort(
            (a, b) => dayjs(a.name).unix() - dayjs(b.name).unix(),
        );

        setImportData(importData);
    }

    function updateInventoryStatusChart(
        inventoryItems: any[],
        categories: any[],
    ) {
        setInventoryItems(inventoryItems);

        const categoriesData: any[] = [];
        const itemsData: any[] = [];

        for (let i = 0; i < categories.length; i++) {
            categoriesData.push({
                name: categories[i].name,
                total: 0,
                id: categories[i].id,
            });
        }

        for (let i = 0; i < inventoryItems.length; i++) {
            const item = inventoryItems[i];
            const matching = categoriesData.find(
                (d) => d.id === item.items.category_id,
            );
            if (matching) {
                matching.total += item.quantity;
            }

            const matchingItem = itemsData.find((d) => d.name === item.items.name);
            if (!matchingItem) {
                itemsData.push({
                    name: item.items.name,
                    quantity: item.quantity,
                });
            } else {
                matchingItem.quantity += item.quantity;
            }
        }

        setCategoriesData(categoriesData);
        setItemsData(itemsData);
    }

    return (
        <Stack pt={"lg"} pl={"sm"}>
            <Stack gap={0}>
                <Title>Welcome back, {cacheData.first_name}</Title>
                <Text
                    style={{
                        color: "rgba(255,255,255,0.45)",
                    }}
                >
                    Manage all warehouses inventory items with ease
                </Text>
            </Stack>
            <Divider/>
            <Grid>
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
                            <Title order={2}>
                                {
                                    inventoryItems.filter(
                                        (i) => dayjs(i.expired_at).unix() - dayjs().unix() > 0,
                                    ).length
                                }
                            </Title>
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
                            <Title order={2}>
                                {
                                    inventoryItems.filter(
                                        (i) => i.quantity < i.items.warning_limit,
                                    ).length
                                }
                            </Title>
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
                            <Title order={2}>
                                {inventoryItems.filter((i) => i.quantity === 0).length}
                            </Title>
                        </Stack>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{base: 12}}>
                    <Card withBorder={true}>
                        <ImportChart chartData={importData}/>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{base: 12, md: 6}}>
                    <Card withBorder={true}>
                        <Group mb={"sm"} gap={5}>
                            <IconChartArea/>
                            <Text>Items in this Warehouse Inventories</Text>
                        </Group>
                        <CategoryChart chartData={categoriesData}/>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{base: 12, md: 6}}>
                    <Card withBorder={true}>
                        <Group mb={"sm"} gap={5}>
                            <IconChartArea/>
                            <Text>Most Stored Items</Text>
                        </Group>
                        <ItemsChart chartData={itemsData}/>
                    </Card>
                </Grid.Col>
            </Grid>
        </Stack>
    );
}
