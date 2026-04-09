import type {ChartProps} from "./charts.type.ts";
import {CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis} from "recharts";
import {APP_COLOR} from "../../enums/styling.ts";

export default function ImportChart({chartData} : ChartProps) {
    return (
        <LineChart
            responsive={true}
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