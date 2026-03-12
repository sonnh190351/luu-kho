import {
    ActionIcon,
    Badge,
    Button,
    Card,
    Divider,
    Grid,
    Group,
    LoadingOverlay,
    type MantineStyleProp, Select,
    Stack,
    Text,
    TextInput,
    Title
} from "@mantine/core";
import {type ChangeEvent, useEffect, useState} from "react";
import StaffRequestModal from "./request.modal.tsx";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import {IconInfoCircle, IconPlus, IconRefresh} from "@tabler/icons-react";
import {DatabaseTables, DISPLAY_TIME_FORMAT} from "../../../../enums/tables.ts";
import DatabaseService from "../../../../services/database/database.service.ts";
import {LocalStorage} from "../../../../enums/localStorage.ts";
import dayjs from "dayjs";
import {RequestStatus, RequestType} from "../../../../enums/request.ts";

const cardStyle: MantineStyleProp = {
    height: '150px',
    position: 'relative',
}

export default function StaffRequestsLayout() {
    const cachedData = JSON.parse(localStorage.getItem(LocalStorage.userData)!);

    const [isLoading, setIsLoading] = useState(false);

    const [isOpenModal, setIsOpenModal] = useState(false);

    const [keyword, setKeyword] = useState<string>("");

    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        (async() => await fetchRequests())();
    }, [])

    async function fetchRequests() {
        setIsLoading(true);

        const service = DatabaseService.getInstance()

        try {
            const response = await service.getByField(
                DatabaseTables.Requests, 'user_id', cachedData.id
            )

            if(response.error) {
                NotificationsService.error("Fetch Requests", response.error.message)
            } else {
                setItems(response.data);
            }

        } catch (e: any) {
            NotificationsService.error("Fetch requests", e.toString());
        }

        setIsLoading(false);
    }

    function handleCloseModal() {
        setIsOpenModal(false)
    }

    async function clearSearch(){
        setKeyword("")
        const temp = localStorage.getItem(DatabaseTables.Items);
        if(!temp) {
            setItems([])
        } else {
            setItems(JSON.parse(temp));
        }
    }

    async function handleSearchByName(e: ChangeEvent<HTMLInputElement>) {
        setKeyword(e.target.value)

        const temp = localStorage.getItem(DatabaseTables.Requests);
        let cache = []
        if(!temp) {
            localStorage.setItem(DatabaseTables.Requests, JSON.stringify(items));
            cache = JSON.parse(JSON.stringify(items));
        } else {
            cache = JSON.parse(temp);
        }

        const matchingItems = cache.filter((i: any) => i.name.startsWith(e.target.value));
        setItems(matchingItems)
    }

    function getBadgeColor(status: RequestStatus) {
        switch (status) {
            case RequestStatus.SUBMITTED:
                return "blue"
            case RequestStatus.PROCESSING:
                return "yellow"
            case RequestStatus.ACCEPTED:
                return "green"
            case RequestStatus.REJECTED:
                return "red"
            default:
                return "gray"
        }
    }

    return (
        <Stack pt={"lg"} pl={"sm"}>
            <LoadingOverlay
                visible={isLoading}
                overlayProps={{ radius: "sm", blur: 2 }}
            />
            <Title>Requests</Title>
            <Grid>
                <Grid.Col span={3}>
                    <Card style={{
                        ...cardStyle
                    }}>
                        <Stack justify={'flex-end'} align={'start'}>
                            <Text>Submitted requests</Text>
                            <Title>1</Title>
                        </Stack>
                    </Card>
                </Grid.Col>
                <Grid.Col span={3}>
                    <Card style={{
                        ...cardStyle
                    }}>
                        <Stack justify={'flex-end'} align={'start'}>
                            <Text>Processing requests</Text>
                            <Title>1</Title>
                        </Stack>
                    </Card>
                </Grid.Col>
                <Grid.Col span={3}>
                    <Card style={{
                        ...cardStyle
                    }}>
                        <Stack justify={'flex-end'} align={'start'}>
                            <Text>Accepted requests</Text>
                            <Title>1</Title>
                        </Stack>
                    </Card>
                </Grid.Col>
                <Grid.Col span={3}>
                    <Card style={{
                        ...cardStyle
                    }}>
                        <Stack justify={'flex-end'} align={'start'}>
                            <Text>Rejected requests</Text>
                            <Title>1</Title>
                        </Stack>
                    </Card>
                </Grid.Col>
            </Grid>
            <Divider mt={'sm'} />
            <Group justify={"space-between"}>
                <Stack gap={5}>
                    <Group>
                        <TextInput
                            label={"Search by Date"}
                            value={keyword}
                            onChange={handleSearchByName}
                        />
                        <Select label={"Search By Status"}></Select>
                    </Group>
                </Stack>
                <Stack gap={5} mt={20}>
                    <Group>
                        <Button
                            onClick={() => setIsOpenModal(true)}
                            leftSection={<IconPlus />}>
                            New Request
                        </Button>
                        <Button
                            onClick={() => fetchRequests()}
                            leftSection={<IconRefresh />}>
                            Refresh
                        </Button>
                    </Group>
                </Stack>
            </Group>
            <Stack>
                {
                    items.map((item: any, index: number) => {
                        return (
                            <Card key={`request-item-${index}`}>
                                <Group justify={"space-between"}>
                                    <Group>
                                        <Title style={{
                                            width: 30
                                        }}>{index + 1}</Title>
                                        <Divider mr={'md'} orientation={'vertical'} />
                                        <Stack gap={5} style={{
                                            width: 250
                                        }}>
                                            <Text style={{
                                                fontWeight: 'bold'
                                            }}>
                                                Type
                                            </Text>
                                            <Group>
                                                {
                                                    RequestType[item.type]
                                                }
                                            </Group>
                                        </Stack>
                                        <Stack gap={5}>
                                            <Text style={{
                                                fontWeight: 'bold'
                                            }}>
                                                Created Date
                                            </Text>
                                            <Group>
                                                {
                                                    dayjs(item.created_at).format(DISPLAY_TIME_FORMAT)
                                                }
                                            </Group>
                                        </Stack>
                                    </Group>
                                    <Group>
                                        <Stack gap={5} style={{
                                            width: 100
                                        }}>
                                            <Text style={{
                                                fontWeight: 'bold'
                                            }}>
                                                Status
                                            </Text>
                                            <Group>
                                                <Badge color={getBadgeColor(item.status)}>{item.status}</Badge>
                                            </Group>
                                        </Stack>
                                        <Divider mr={'lg'} orientation={'vertical'} />
                                        <Button leftSection={<IconInfoCircle />}>
                                            View Details
                                        </Button>
                                    </Group>
                                </Group>
                            </Card>
                        )
                    })
                }
            </Stack>

            <StaffRequestModal open={isOpenModal} refresh={fetchRequests} close={handleCloseModal} />
        </Stack>
    )
}