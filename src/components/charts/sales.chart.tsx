import {CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis} from "recharts";
import {APP_COLOR} from "../../enums/styling.ts";
import type {ChartProps} from "./charts.type.ts";

export default function SalesChart({chartData} : ChartProps) {
    return (
        <LineChart
            data={chartData}
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
    )
}