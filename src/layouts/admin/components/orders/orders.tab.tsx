import {LoadingOverlay, Stack, Title} from "@mantine/core";
import {useEffect, useState} from "react";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import OperationService from "../../../../services/operations/operationService.ts";
import {DatabaseTables} from "../../../../enums/tables.ts";

export default function OrdersTab() {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        (async() => await fetchOrders())();
    }, []);

    async function fetchOrders() {
        setIsLoading(true)
        try {
            const service = OperationService.getInstance()
            const orders = await service.getAllWarehousesOrders()
        } catch (e: any) {
            NotificationsService.error("Fetch orders", e.toString());
        }
        setIsLoading(false)
    }

    return (
        <Stack pt={"lg"} pl={"sm"}>
            <LoadingOverlay
                visible={isLoading}
                overlayProps={{ radius: "sm", blur: 2 }}
            />
            <Title>Orders</Title>
        </Stack>
    )
}