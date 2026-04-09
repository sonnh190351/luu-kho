import {CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis} from "recharts";
import type {ChartProps} from "./charts.type.ts";
import {OrderStatus} from "../../enums/orders.ts";

export default function OrdersChart({chartData} : ChartProps) {
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
            <Line type="monotone" dataKey={OrderStatus.RECEIVED} stroke={"#339af0"}/>
            <Line type="monotone" dataKey={OrderStatus.PROCESSING} stroke={"#fcc419"}/>
            <Line type="monotone" dataKey={OrderStatus.FINISHED} stroke={"#12b886"}/>
        </LineChart>
    )
}