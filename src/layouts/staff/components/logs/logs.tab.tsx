import {LoadingOverlay, Stack, Title, Text} from "@mantine/core";
import {useEffect, useState} from "react";
import {DatabaseTables} from "../../../../enums/tables.ts";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import InventoryService from "../../../../services/operations/inventory.service.ts";

export default function StaffLogsLayout() {
    const [isLoading, setIsLoading] = useState(false);

    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        (async() => await fetchLogs())();
    }, [])

    async function fetchLogs() {
        setIsLoading(true);
        try {
            const data = await InventoryService.getInstance().getAllRows(DatabaseTables.Logs);
            setLogs(data);
        } catch (e: any) {
            NotificationsService.error("Fetch categories", e.toString());
        }
        setIsLoading(false);
    }

    return (
        <Stack pt={"lg"} pl={"sm"}>
            <LoadingOverlay
                visible={isLoading}
                overlayProps={{ radius: "sm", blur: 2 }}
            />
            <Title>Logs</Title>
            <div style={{
                height: '82dvh',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '5px'
            }}>
                {logs.map((log: any, index: number) => (
                    <Text key={`log-row-${index}`}>[{log.created_at}] {log.details}</Text>
                ))}
            </div>
        </Stack>
    )
}