import {LoadingOverlay, Stack, Title, Text, Group, Select, Divider, Button, TextInput} from "@mantine/core";
import {useEffect, useState} from "react";
import {DatabaseTables, DISPLAY_TIME_FORMAT} from "../../../enums/tables.ts";
import {NotificationsService} from "../../../services/notifications/notifications.service.ts";
import OperationService from "../../../services/operations/operationService.ts";
import {useForm} from "@mantine/form";
import {APP_COLOR, BUTTON_COLOR} from "../../../enums/styling.ts";
import {IconCalendar, IconFilter, IconHandClick, IconMail, IconRefresh} from "@tabler/icons-react";
import {DateTimePicker} from "@mantine/dates";
import {LocalStorage} from "../../../enums/localStorage.ts";
import dayjs from "dayjs";

interface FilterFormValues {
    email: string,
    start_date?: Date,
    end_date?: Date,
    action_type?: string
}

interface LogsTabProps {
    log_actions: Record<string, string>;
}

export default function LogsTab({ log_actions }: LogsTabProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSorted, setIsSorted] = useState(false);

    const form = useForm<FilterFormValues>({
        initialValues: {
            email: "",
        }
    })

    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        (async () => await fetchLogs())();
    }, [])

    async function fetchLogs() {
        setIsLoading(true);
        try {
            const data = await OperationService.getInstance().getAllRows(DatabaseTables.Logs);
            const sorted = data.filter((d) => {
                const matching = Object.values(log_actions)
                for(let i = 0; i < matching.length; i++) {
                    if(d.details.includes(`[${matching[i]}]`)) return true
                }
                return false
            })
            setLogs(sorted);
            calculateSortData()
        } catch (e: any) {
            NotificationsService.error("Fetch categories", e.toString());
        }
        setIsLoading(false);
    }

    function calculateSortData() {

    }

    function handleFilter() {
        let cache = localStorage.getItem(LocalStorage.logs)
        if (!cache) {
            localStorage.setItem(LocalStorage.logs, JSON.stringify(logs));
            cache = JSON.stringify(logs)
        }

        const criteria = form.getValues()
        let hasSorted = false
        let temp = JSON.parse(cache);

        if (criteria.email) {
            hasSorted = true
            temp = temp.filter((i: any) => i.details.includes(`[${criteria.email}]`))
        }

        if (criteria.start_date) {
            hasSorted = true
            temp = temp.filter((t: any) => criteria.start_date!.getTime() <= new Date(t.created_at).getTime())
        }

        if (criteria.end_date) {
            hasSorted = true
            temp = temp.filter((t: any) => new Date(t.created_at).getTime() <= criteria.end_date!.getTime())
        }

        if (criteria.action_type) {
            hasSorted = true
            temp = temp.filter((t: any) => t.details.includes(`[${criteria.action_type}]`))
        }

        if (hasSorted) {
            setIsSorted(hasSorted)
            setLogs(temp)
        }
    }

    async function handleClearFilter() {
        form.reset()
        setIsSorted(false)
        await fetchLogs()
    }

    const action_options = Object.values(log_actions).map((v) => ({
        value: v,
        label: v
    }))

    return (
        <Stack pt={"lg"} pl={"sm"}>
            <LoadingOverlay
                visible={isLoading}
                overlayProps={{radius: "sm", blur: 2}}
            />
            <Stack gap={0}>
                <Text>Management</Text>
                <Title>Activity Logs</Title>
            </Stack>
            <Divider/>
            <Group justify={'space-between'}>
                <Group gap={10}>
                    <TextInput
                        {...form.getInputProps('email')}
                        style={{width: 200}} leftSection={<IconMail/>}
                        label={"Sort by User Email"}/>
                    <DateTimePicker
                        {...form.getInputProps('start_date')} leftSection={<IconCalendar/>} style={{
                        width: 200
                    }} label={"Sort By Start Date"}/>
                    <DateTimePicker
                        {...form.getInputProps('end_date')} leftSection={<IconCalendar/>} style={{
                        width: 200
                    }} label={"Sort By End Date"}/>
                    <Select
                        data={action_options}
                        {...form.getInputProps('action_type')} style={{width: 200}} leftSection={<IconHandClick/>}
                        label={"Sort By Action Type"}/>
                    <Group gap={10} pt={25}>
                        <Button onClick={handleFilter} leftSection={<IconFilter/>} color={APP_COLOR.PRIMARY}>Sort</Button>
                        {
                            isSorted && <Button onClick={handleClearFilter} leftSection={<IconRefresh/>}
                                                color={BUTTON_COLOR.PRIMARY}>Reset</Button>
                        }
                    </Group>
                </Group>

                <Button onClick={fetchLogs} mt={25} leftSection={<IconRefresh/>} color={APP_COLOR.PRIMARY}>Refresh</Button>
            </Group>

            <div style={{
                height: '72dvh',
                overflowY: 'scroll',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '2px',
                fontFamily: "Google Sans Code",
            }}>
                {logs.map((log: any, index: number) => (
                    <Text
                        key={`log-row-${index}`}>[{dayjs(log.created_at).format(DISPLAY_TIME_FORMAT)}] {log.details}</Text>
                ))}
            </div>
        </Stack>
    )
}
