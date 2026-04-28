import {
    ActionIcon,
    Badge,
    Button,
    Card, Center,
    Divider,
    Grid,
    Group,
    LoadingOverlay,
    type MantineStyleProp, Select,
    Stack,
    Text,
    Title
} from "@mantine/core";
import { useEffect, useState} from "react";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import {IconFilter, IconPlus, IconRefresh, IconX} from "@tabler/icons-react";
import {DatabaseTables, DISPLAY_TIME_FORMAT} from "../../../../enums/tables.ts";
import {LocalStorage} from "../../../../enums/localStorage.ts";
import dayjs from "dayjs";
import {CommonRequestType, RequestStatus, StaffRequestType} from "../../../../enums/request.ts";
import StaffRequestModal from "./request.modal.tsx";
import {BUTTON_COLOR} from "../../../../enums/styling.ts";
import UtilsService from "../../../../services/utils.ts";
import RequestService from "../../../../services/operations/request/request.service.ts";
import {useForm} from "@mantine/form";

const cardStyle: MantineStyleProp = {
    height: '150px',
    position: 'relative',
}

interface RequestFilterForm {
    requestType: StaffRequestType | null,
    status: RequestStatus | null
}

export default function RequestsLayout() {

    const requestFilterForm = useForm<RequestFilterForm>({
        initialValues: {
            requestType: null,
            status: null
        }
    });

    const [isFiltered, setFiltered] = useState<boolean>(false);

    const cachedData = JSON.parse(localStorage.getItem(LocalStorage.userData)!);

    const [isLoading, setIsLoading] = useState(false);

    const [isOpenModal, setIsOpenModal] = useState(false);

    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        (async () => await fetchRequests())();
    }, [])

    async function fetchRequests() {
        setIsLoading(true);

        const service = RequestService.getInstance()

        try {
            const response = await service.getRequestDetailsByUserId(cachedData.id)
            setItems(response);
        } catch (e: any) {
            NotificationsService.error("Fetch requests", e.toString());
        }

        setIsLoading(false);
    }

    function handleCloseModal() {
        setIsOpenModal(false)
    }


    function handleFilter() {
        const {requestType, status} = requestFilterForm.getValues()
        if (!requestType && !status) {
            return
        }

        setFiltered(true)
        const temp = sessionStorage.getItem(DatabaseTables.Requests);
        let cache
        if (!temp) {
            sessionStorage.setItem(DatabaseTables.Requests, JSON.stringify(items));
            cache = JSON.parse(JSON.stringify(items));
        } else {
            cache = JSON.parse(temp);
        }

        if (status) {
            cache = cache.filter((i: any) => i.status === status);
        }

        if (requestType) {
            cache = cache.filter((i: any) => i.type === requestType);
        }

        setItems(cache)
    }

    async function handleClearFilter() {
        setFiltered(false)
        requestFilterForm.reset()
        await fetchRequests()
    }

    return (
        <Stack pt={"lg"} pl={"sm"}>
            <LoadingOverlay
                style={{
                    position: "fixed",
                }}
                visible={isLoading}
                overlayProps={{radius: "sm", blur: 2}}
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
            <Divider mt={'sm'}/>
            <Group justify={"space-between"}>
                <Stack gap={5}>
                    <Text>Filter</Text>
                    <Group>
                        <Select
                            {...requestFilterForm.getInputProps('requestType')}
                            allowDeselect={true} clearable={true}
                            data={[...Object.keys(StaffRequestType), ...Object.keys(CommonRequestType)]}
                            placeholder={"Request Type"}></Select>
                        <Select
                            {...requestFilterForm.getInputProps('status')}
                            allowDeselect={true} clearable={true}
                            data={Object.values(RequestStatus)}
                            placeholder={"Search By Status"}></Select>
                        <ActionIcon onClick={handleFilter} color={BUTTON_COLOR.PRIMARY} variant={'outline'}
                                    size={"lg"}>
                            <IconFilter/>
                        </ActionIcon>
                        {
                            isFiltered && <ActionIcon size={"lg"} onClick={handleClearFilter} color={"red"}>
                                <IconX/>
                            </ActionIcon>
                        }
                    </Group>
                </Stack>
                <Stack gap={5} mt={20}>
                    <Group>
                        <Button
                            color={BUTTON_COLOR.PRIMARY}
                            onClick={() => setIsOpenModal(true)}
                            leftSection={<IconPlus/>}>
                            New Request
                        </Button>
                        <Button
                            color={BUTTON_COLOR.PRIMARY}
                            onClick={() => fetchRequests()}
                            leftSection={<IconRefresh/>}>
                            Refresh
                        </Button>
                    </Group>
                </Stack>
            </Group>
            <Stack>
                {
                    items.length > 0 ? items.map((item: any, index: number) => {
                        return (
                            <Card key={`request-item-${index}`}>
                                <Group justify={"space-between"}>
                                    <Group>
                                        <Title style={{
                                            width: 30
                                        }}>{index + 1}</Title>
                                        <Divider mr={'md'} orientation={'vertical'}/>
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
                                                    item.type
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
                                                            Handled
                                                            by: {item.handler.last_name} {item.handler.first_name}
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
                                                <Badge
                                                    color={UtilsService.getRequestBadgeColor(item.status)}>{item.status}</Badge>
                                            </Group>
                                        </Stack>
                                    </Group>
                                </Group>
                            </Card>
                        )
                    }) : <Group justify={"center"} style={{
                        height: '100px'
                    }}>
                        <Center>
                            <Text>No Request Available</Text>
                        </Center>
                    </Group>
                }
            </Stack>

            <StaffRequestModal open={isOpenModal} refresh={fetchRequests} close={handleCloseModal}/>
        </Stack>
    )
}