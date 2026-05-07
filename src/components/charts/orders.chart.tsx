import {CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis} from "recharts";
import type {ChartProps} from "./charts.type.ts";
import {OrderStatus} from "../../enums/orders.ts";
import {useForm} from "@mantine/form";
import {useEffect, useState} from "react";
import {ActionIcon, Divider, Group, Select, Stack, Text} from "@mantine/core";
import {IconChartArea, IconFilter, IconX} from "@tabler/icons-react";
import {APP_COLOR, BUTTON_COLOR} from "../../enums/styling.ts";

const ChartSortType = ['Year', 'Month', 'Day']

interface sortFormData {
    month: string;
    year: string;
}

export default function OrdersChart({chartData} : ChartProps) {

    const filterForm = useForm<sortFormData>({
        initialValues: {
            month: "N/A",
            year: String(new Date().getFullYear())
        }
    })

    const [isFiltered, setIsFiltered] = useState<boolean>(false);

    const [sortType, setSortType] = useState<string>("Day");

    const [sortedData, setSortedData] = useState<any[]>([])

    useEffect(() => {
        mapChartData(chartData)
    }, [chartData, sortType]);

    function mapChartData(data: any[]) {
        handleChangeSort(data, sortType)
    }

    function handleFilter(){
        setIsFiltered(true)
        const {month, year} = filterForm.getValues()

        let date = year;
        if(month !== "N/A"){
            const monthStr = Number(month) < 10 ? '0' + month : month
            date = [year, monthStr].join("-")
        }

        const matchingData = chartData.filter((c) => c.name.startsWith(date))
        mapChartData(matchingData)
    }

    function handleClearFilter(){
        setIsFiltered(false)
        filterForm.reset()
        mapChartData(chartData)
    }

    function handleChangeSort(data: any[], sortType: string) {
        const names: Record<string, any> = {}

        // Create data point map
        for(let i = 0; i < data.length; i++) {
            const dataPoint = data[i]
            const name = dataPoint.name.split("-")

            console.log(dataPoint)

            switch (sortType) {
                case "Year":
                    if(!names[name[0]]) {
                        names[name[0]] = {
                            [OrderStatus.RECEIVED]: 0,
                            [OrderStatus.PROCESSING]: 0,
                            [OrderStatus.FINISHED]: 0,
                        }
                    }

                    names[name[0]][OrderStatus.RECEIVED] += dataPoint[OrderStatus.RECEIVED]
                    names[name[0]][OrderStatus.PROCESSING] += dataPoint[OrderStatus.PROCESSING]
                    names[name[0]][OrderStatus.FINISHED] += dataPoint[OrderStatus.FINISHED]

                    break
                case "Month":
                    if(!names[[name[0], name[1]].join("-")]) {
                        names[[name[0], name[1]].join("-")] = {
                            [OrderStatus.RECEIVED]: 0,
                            [OrderStatus.PROCESSING]: 0,
                            [OrderStatus.FINISHED]: 0,
                        }
                    }

                    names[[name[0], name[1]].join("-")][OrderStatus.RECEIVED] += dataPoint[OrderStatus.RECEIVED]
                    names[[name[0], name[1]].join("-")][OrderStatus.PROCESSING] += dataPoint[OrderStatus.PROCESSING]
                    names[[name[0], name[1]].join("-")][OrderStatus.FINISHED] += dataPoint[OrderStatus.FINISHED]

                    break
                case "Day":
                    if(!names[dataPoint.name]) {
                        names[dataPoint.name] = {
                            [OrderStatus.RECEIVED]: 0,
                            [OrderStatus.PROCESSING]: 0,
                            [OrderStatus.FINISHED]: 0,
                        }
                    }

                    names[dataPoint.name][OrderStatus.RECEIVED] += dataPoint[OrderStatus.RECEIVED]
                    names[dataPoint.name][OrderStatus.PROCESSING] += dataPoint[OrderStatus.PROCESSING]
                    names[dataPoint.name][OrderStatus.FINISHED] += dataPoint[OrderStatus.FINISHED]
                    break
                default:
                    break
            }
        }

        setSortedData(Object.entries(names).map(([key, value]) => {
            return {
                name: key,
                [OrderStatus.RECEIVED]: value[OrderStatus.RECEIVED],
                [OrderStatus.PROCESSING]: value[OrderStatus.PROCESSING],
                [OrderStatus.FINISHED]: value[OrderStatus.FINISHED],
            }
        }))
    }

    return (
        <Stack>
            <Group mb={'sm'}  justify={'space-between'}>
                <Group gap={5}>
                    <IconChartArea />
                    <Text>
                        Orders Summary
                    </Text>
                </Group>
                <Group>
                    <Text>
                        Group by:
                    </Text>
                    <Select style={{
                        width: 160
                    }} value={sortType} onChange={(e) => {
                        if(e) {
                            setSortType(e)
                        }
                    }} data={ChartSortType} />

                    <Divider orientation={'vertical'} />
                    <Text>
                        Year:
                    </Text>
                    <Select style={{
                        width: 160
                    }} key={filterForm.key('year')} {...filterForm.getInputProps('year')} data={['2026', '2025', '2024', '2023', '2022', '2021']} />
                    <Text>
                        Month:
                    </Text>
                    <Select style={{
                        width: 160
                    }} key={filterForm.key('month')} {...filterForm.getInputProps('month')} data={["N/A", ...Array.from({ length: 12 }, (_, i) => String(i + 1))]}  />
                    <ActionIcon onClick={handleFilter} variant={'transparent'} color={APP_COLOR.PRIMARY}>
                        <IconFilter />
                    </ActionIcon>
                    {
                        isFiltered && <ActionIcon onClick={handleClearFilter} variant={'transparent'} color={BUTTON_COLOR.PRIMARY}>
                            <IconX />
                        </ActionIcon>
                    }
                </Group>
            </Group>
            <LineChart
                responsive={true}
                data={sortedData}
                style={{
                    width: '100%',
                    maxHeight: '30vh',
                    aspectRatio: 1.318
                }}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="name"/>
                <YAxis />
                <Tooltip/>
                <Legend/>
                <Line type="monotone" dataKey={OrderStatus.RECEIVED} stroke={"#339af0"}/>
                <Line type="monotone" dataKey={OrderStatus.PROCESSING} stroke={"#fcc419"}/>
                <Line type="monotone" dataKey={OrderStatus.FINISHED} stroke={"#12b886"}/>
            </LineChart>
        </Stack>
    )
}