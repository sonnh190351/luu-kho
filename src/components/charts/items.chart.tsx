import {Bar, BarChart, Legend, XAxis, YAxis} from "recharts";
import {APP_COLOR} from "../../enums/styling.ts";
import type {ChartProps} from "./charts.type.ts";

export default function ItemsChart({chartData}: ChartProps) {
    return (
        <BarChart
            responsive={true}
            data={chartData}
            style={{width: '100%', height: '500px', aspectRatio: 1}}>
            <Bar dataKey={"quantity"} fill={APP_COLOR.PRIMARY} />
            <XAxis dataKey="name"/>
            <YAxis />
            <Legend/>
        </BarChart>
    )
}