import {Bar, BarChart, Legend, Tooltip, XAxis, YAxis} from "recharts";
import {APP_COLOR} from "../../enums/styling.ts";
import type {ChartProps} from "./charts.type.ts";

export default function ItemsChart({chartData}: ChartProps) {

    const sorted = JSON.parse(JSON.stringify(chartData)).sort((a: any, b: any) => a.quantity - b.quantity)

    return (
        <BarChart
            responsive={true}
            data={sorted}
            style={{width: '100%', height: '500px', aspectRatio: 1}}>
            <Bar dataKey={"quantity"} fill={APP_COLOR.PRIMARY} />
            <XAxis dataKey="name"/>
            <YAxis />
            <Legend/>
            <Tooltip />
        </BarChart>
    )
}