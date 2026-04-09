import {Label, Legend, Pie, PieChart, Tooltip} from "recharts";
import type {ChartProps} from "./charts.type.ts";

export default function CategoryChart({chartData}: ChartProps) {
    return (
        <PieChart
            responsive={true}
            style={{width: '100%', height: '500px', aspectRatio: 1}}
        >
            <Pie
                dataKey={"total"}
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"/>
            <Label/>
            <Legend/>
            <Tooltip/>
        </PieChart>
    )
}