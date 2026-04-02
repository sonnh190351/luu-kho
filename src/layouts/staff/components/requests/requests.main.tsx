import {
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
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import { IconPlus, IconRefresh} from "@tabler/icons-react";
import {DatabaseTables, DISPLAY_TIME_FORMAT} from "../../../../enums/tables.ts";
import {LocalStorage} from "../../../../enums/localStorage.ts";
import dayjs from "dayjs";
import {CommonRequestType} from "../../../../enums/request.ts";
import StaffRequestModal from "./request.modal.tsx";
import {BUTTON_COLOR} from "../../../../enums/styling.ts";
import UtilsService from "../../../../services/utils.ts";
import RequestService from "../../../../services/operations/request/request.service.ts";

const cardStyle: MantineStyleProp = {
    height: '150px',
    position: 'relative',
}

export default function RequestsLayout() {
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

        const service = RequestService.getInstance()

        try {
            const response = await service.getRequestDetailsByUserId(cachedData.id)
            setItems(response);
            console.log(response)
        } catch (e: any) {
            NotificationsService.error("Fetch requests", e.toString());
        }

        setIsLoading(false);
    }

    function handleCloseModal() {
        setIsOpenModal(false)
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

    return (
        <Stack pt={"lg"} pl={"sm"}>
            <LoadingOverlay
                style={{
                    position: "fixed",
                }}
                visible={isLoading}
                overlayProps={{ radius: "sm", blur: 2 }}
            />
            <Stack gap={0}>
                <Text>Management</Text>
                <Title>Requests Data</Title>
            </Stack>
            <Divider/>
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
                            color={BUTTON_COLOR.PRIMARY}
                            onClick={() => setIsOpenModal(true)}
                            leftSection={<IconPlus />}>
                            New Request
                        </Button>
                        <Button
                            color={BUTTON_COLOR.PRIMARY}
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
                                                    CommonRequestType[item.type as keyof typeof CommonRequestType]
                                                }
                                            </Group>
                                        </Stack>
                                        <Stack mr={'xl'} gap={5} style={{
                                            width: 250
                                        }}>
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
                                        <Stack gap={5} style={{
                                            width: 250
                                        }}>
                                            <Text style={{
                                                fontWeight: 'bold'
                                            }}>
                                                Handling Result
                                            </Text>
                                            <Group>
                                                {
                                                    item.handler ? (
                                                        <>
                                                            Handled by: {item.handler.last_name} {item.handler.first_name}
                                                        </>
                                                    ) : <Text style={{
                                                        color: '#fa5252'
                                                    }}>Not yet handled</Text>
                                                }
                                            </Group>
                                        </Stack>
                                        {
                                            item.handler && <Stack gap={5}>
                                                <Text style={{
                                                    fontWeight: 'bold'
                                                }}>
                                                    Remark
                                                </Text>
                                                <Group>
                                                    {
                                                        item.remark ?? "N/A"
                                                    }
                                                </Group>
                                            </Stack>
                                        }
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
                                                <Badge color={UtilsService.getRequestBadgeColor(item.status)}>{item.status}</Badge>
                                            </Group>
                                        </Stack>
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