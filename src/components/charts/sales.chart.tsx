import {CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis} from "recharts";
import {APP_COLOR, BUTTON_COLOR} from "../../enums/styling.ts";
import type {ChartProps} from "./charts.type.ts";
import {ActionIcon, Divider, Group, Select, Stack, Text} from "@mantine/core";
import { useEffect, useState} from 'react'
import {IconChartArea, IconFilter, IconX} from "@tabler/icons-react";
import {useForm} from "@mantine/form";

const ChartSortType = ['Year', 'Month', 'Day']

interface sortFormData {
    month: string;
    year: string;
}

export default function SalesChart({chartData} : ChartProps) {

    const filterForm = useForm<sortFormData>({
        initialValues: {
            month: "N/A",
            year: String(new Date().getFullYear())
        }
    })

    const [isFiltered, setIsFiltered] = useState<boolean>(false);

    const [sortType, setSortType] = useState<string>("Month");

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
            const monthStr = month < 10 ? '0' + month : month
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
        const names = {}

        // Create data point map
        for(let i = 0; i < data.length; i++) {
            const dataPoint = data[i]
            const name = dataPoint.name.split("-")
            switch (sortType) {
                case "Year":
                    if(!names[name[0]]) {
                        names[name[0]] = 0
                    }
                    names[name[0]] += dataPoint.total
                    break
                case "Month":
                    if(!names[[name[0], name[1]].join("-")]) {
                        names[[name[0], name[1]].join("-")] = 0
                    }
                    names[[name[0], name[1]].join("-")] += dataPoint.total
                    break
                case "Day":
                    if(!names[dataPoint.name]) {
                        names[dataPoint.name] = 0
                    }
                    names[dataPoint.name] += dataPoint.total
                    break
                default:
                    break
            }
        }

        setSortedData(Object.entries(names).map(([key, value]) => {
            return {
                name: key,
                total: value
            }
        }))
    }


    return (
        <Stack>
            <Group mb={'sm'}  justify={'space-between'}>
                <Group gap={5}>
                    <IconChartArea />
                    <Text>
                        Total Order Sales
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
                <Line type="monotone" dataKey="total" stroke={APP_COLOR.PRIMARY}/>
            </LineChart>
        </Stack>

    )
}