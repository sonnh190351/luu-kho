import {LoadingOverlay, Stack, Title} from "@mantine/core";
import {useEffect, useState} from "react";
import {DatabaseTables} from "../../../../enums/tables.ts";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import InventoryService from "../../../../services/operations/inventory.service.ts";

export default function StaffLogsTab() {
    const [isLoading, setIsLoading] = useState(false);

    const [logs, setLogs] = useState<string>("");

    useEffect(() => {
        (async() => await fetchLogs())();
    }, [])

    async function fetchLogs() {
        setIsLoading(true);
        try {
            const data = await InventoryService.getInstance().getAllRows(DatabaseTables.Logs);
            let entry = ""
            for (let i = 0; i < data.length; i++) {
                entry += `${i+1}\t${data[i].details}\n`;
            }
            setLogs(entry);
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
            <Stack p={'xs'} style={{
                height: '82dvh',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '5px',
                whiteSpace: 'pre-wrap',
                overflowY: 'scroll'
            }}>
                {logs}
            </Stack>
        </Stack>
    )
}