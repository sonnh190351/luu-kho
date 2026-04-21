import {Card, Divider, Grid, Group, Stack, Text, Title} from "@mantine/core";
import {LocalStorage} from "../../../../enums/localStorage.ts";
import {useEffect, useState} from "react";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import OperationService from "../../../../services/operations/operationService.ts";
import {IconUser} from "@tabler/icons-react";
import {OrderStatus} from "../../../../enums/orders.ts";
import OrdersChart from "../../../../components/charts/orders.chart.tsx";
import dayjs from "dayjs";

export default function StaffDashboardTab() {
    const cacheData = JSON.parse(localStorage.getItem(LocalStorage.userData)!);

    const [orders, setOrders] = useState<any[]>([]);
    const [ordersChartData, setOrdersChartData] = useState<any[]>([]);

    useEffect(() => {
        (async () => await fetchDashboardData())();
    }, []);

    async function fetchDashboardData() {
        try {
            // fetch data of order
            await fetchOrderData()

            // fetch data of requests
            await fetchRequestsData()

        } catch (e: any) {
            NotificationsService.error("Fetch Staff Dashboard Data", e.toString())
        }
    }

    async function fetchOrderData() {
        const service = OperationService.getInstance()

        const data = await service.getWarehouseOrders(cacheData.warehouses.id)
        setOrders(data)

        let orderChartData: any[] = [
            {
                name: dayjs().format("YYYY-MM-DD"),
                [OrderStatus.RECEIVED]: 0,
                [OrderStatus.FINISHED]: 0,
                [OrderStatus.PROCESSING]: 0,
            }
        ]

        for(let i = 0; i < data.length; i++) {
            const order = data[i];
            const date = dayjs(order.created_at).format('YYYY-MM-DD')
            const matching = orderChartData.find((d) => d.name === date)
            if (matching) {
                switch (order.status) {
                    case OrderStatus.RECEIVED:
                        matching[OrderStatus.RECEIVED] += 1;
                        break
                    case OrderStatus.FINISHED:
                        matching[OrderStatus.FINISHED] += 1;
                        break
                    case OrderStatus.PROCESSING:
                        matching[OrderStatus.PROCESSING] += 1;
                        break
                    default:
                        break
                }
            } else {
                switch (order.status) {
                    case OrderStatus.RECEIVED:
                        orderChartData.push({
                            name: date,
                            [OrderStatus.RECEIVED]: 1,
                            [OrderStatus.FINISHED]: 0,
                            [OrderStatus.PROCESSING]: 0,
                        })
                        break
                    case OrderStatus.FINISHED:
                        orderChartData.push({
                            name: date,
                            [OrderStatus.RECEIVED]: 0,
                            [OrderStatus.FINISHED]: 1,
                            [OrderStatus.PROCESSING]: 0,
                        })
                        break
                    case OrderStatus.PROCESSING:
                        orderChartData.push({
                            name: date,
                            [OrderStatus.RECEIVED]: 0,
                            [OrderStatus.FINISHED]: 0,
                            [OrderStatus.PROCESSING]: 1,
                        })
                        break
                    default:
                        break
                }

            }
        }

        orderChartData = orderChartData.sort((a, b) => dayjs(a.name).unix() - dayjs(b.name).unix())

        setOrdersChartData(orderChartData)
    }

    async function fetchRequestsData() {
        console.log('Hello')

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
                <Grid.Col span={4}>
                    <Card withBorder={true}>
                        <Stack gap={10}>
                            <Group gap={5}>
                                <IconUser/>
                                <Text>Received Orders</Text>
                            </Group>
                            <Title order={2}>{
                                orders.filter((o) => o.status === OrderStatus.RECEIVED).length
                            }</Title>
                        </Stack>
                    </Card>
                </Grid.Col>
                <Grid.Col span={4}>
                    <Card withBorder={true}>
                        <Stack gap={10}>
                            <Group gap={5}>
                                <IconUser/>
                                <Text>Processing Orders</Text>
                            </Group>
                            <Title order={2}>{
                                orders.filter((o) => o.status === OrderStatus.PROCESSING).length
                            }</Title>
                        </Stack>
                    </Card>
                </Grid.Col>
                <Grid.Col span={4}>
                    <Card withBorder={true}>
                        <Stack gap={10}>
                            <Group gap={5}>
                                <IconUser/>
                                <Text>Finished Orders</Text>
                            </Group>
                            <Title order={2}>{
                                orders.filter((o) => o.status === OrderStatus.FINISHED).length
                            }</Title>
                        </Stack>
                    </Card>
                </Grid.Col>
                <Grid.Col>
                    <Card withBorder={true}>
                        <Stack gap={10}>
                            <OrdersChart chartData={ordersChartData} />
                        </Stack>
                    </Card>
                </Grid.Col>
            </Grid>
        </Stack>
    )
}