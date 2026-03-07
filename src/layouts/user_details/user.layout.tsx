import {
    Avatar,
    Button,
    Container,
    Divider,
    Grid,
    Group,
    PasswordInput,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import {LocalStorage} from "../../enums/localStorage";
import UtilsService from "../../services/utils.ts";
import {useEffect, useRef, useState} from "react";
import type {Warehouses} from "../../models/warehouses.ts";
import InventoryService from "../../services/operations/inventory.service.ts";
import {DatabaseTables} from "../../enums/tables.ts";
import {NotificationsService} from "../../services/notifications/notifications.service.ts";
import {useForm} from "@mantine/form";
import dayjs from "dayjs";
import {FormValidationService} from "../../services/validatior/form-validation.service.ts";
import {IconLock} from "@tabler/icons-react";
import {DatePickerInput} from "@mantine/dates";

interface UserDetailsFormValues {
    old_password: string;
    new_password: string;
    address: string;
    dob: string | null;
}

export default function UserDetails() {
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const cachedData = localStorage.getItem(LocalStorage.userData);
    const loginData = JSON.parse(cachedData!);

    const [warehouseData, setWarehouseData] = useState<Warehouses | null>(null);

    const [showPassword, setShowPassword] = useState<boolean>(false);

    const [avatar, setAvatar] = useState(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    async function fetchWarehouseDetails() {
        try {
            const service = InventoryService.getInstance();
            const data = await service.getAllMatching(DatabaseTables.Warehouses, 'id', loginData.warehouses.id);
            if (data.length > 0) {
                setWarehouseData(data[0]);
            }
        } catch (e: any) {
            NotificationsService.error("Fetch Items", e.toString());
        }
    }

    const form = useForm<UserDetailsFormValues>({
        initialValues: {
            old_password: "",
            new_password: "",
            address: loginData.address,
            dob: dayjs(loginData.dob).format("YYYY-MM-DD"),
        },
        validate: {
            address: FormValidationService.validateAddress,
            old_password: FormValidationService.validatePassword,
            new_password: FormValidationService.validatePassword,
        },
    });

    useEffect(() => {
        console.log('fetch')
        if (loginData.warehouses.id) {
            (async () => await fetchWarehouseDetails())();
        }
    }, []);

    function handleClickAvatar() {
        avatarInputRef.current?.click();
    }

    function handleUploadAvatar(e: any) {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                alert("Please upload a valid image file.");
                return;
            }
            setAvatar(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    }

    function handleSubmitAvatar() {

    }

    return (
        <Container fluid p={0}>
            <Stack
                p={0}
                m={0}>
                <Group p={0} m={0} gap={30}>
                    <div>
                        <input onChange={handleUploadAvatar} ref={avatarInputRef} type="file" id="fileInput"
                               accept="image/*" style={{display: "none", position: "absolute"}}/>
                        <Avatar onClick={handleClickAvatar} style={{
                            border: '1px solid rgba(255,255,255,0.2)'
                        }} src={previewUrl ?? UtilsService.getAvatarUrl(loginData.avatar)} size={140}></Avatar>
                    </div>

                    <Stack gap="2">
                        <Title order={3}>{loginData.first_name} {loginData.last_name}</Title>
                        <Text>{UtilsService.getRoleLevel(loginData.role)}</Text>
                        <Text>{loginData.email}</Text>
                        <Button onClick={handleSubmitAvatar} disabled={!previewUrl} mt={'xs'} size={'xs'}>
                            Save
                        </Button>
                    </Stack>
                </Group>
                <Divider/>
                <Title order={4}>Personal Information</Title>
                <form>
                    <Grid>
                        <Grid.Col span={12}>
                            <Stack gap={3}>
                                <DatePickerInput
                                    {...form.getInputProps('dob')}
                                    label={"Date of Birth"}
                                    required={true}
                                    value={
                                        form.values.dob
                                            ? new Date(form.values.dob)
                                            : new Date()
                                    }
                                    onChange={(e) => {
                                        if (e) {
                                            form.setValues({
                                                dob: dayjs(e).format("YYYY-MM-DD"),
                                            });
                                        }
                                    }}
                                />
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Stack gap={3}>
                                <TextInput
                                    required
                                    {...form.getInputProps('address')}
                                    label={"Address"}
                                    value={form.values.address}
                                    onChange={(e) =>
                                        form.setValues({
                                            address: UtilsService.sanitize(
                                                e.target.value,
                                            ),
                                        })
                                    }
                                />
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Stack gap={3}>
                                <PasswordInput
                                    visible={showPassword}
                                    onVisibilityChange={(e) => setShowPassword(e)}
                                    label="Old Password"
                                    placeholder="Old password"
                                    leftSection={<IconLock size={16}/>}
                                    {...form.getInputProps("old_password")}
                                    required
                                />
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Stack gap={3}>
                                <PasswordInput
                                    visible={showPassword}
                                    onVisibilityChange={(e) => setShowPassword(e)}
                                    label="New Password"
                                    placeholder="New password"
                                    leftSection={<IconLock size={16}/>}
                                    {...form.getInputProps("new_password")}
                                    required
                                />
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Button fullWidth={true}>
                                Save
                            </Button>
                        </Grid.Col>
                    </Grid>
                </form>
                <Divider/>
                <Title order={4}>Assigned Warehouse Details</Title>
                {
                    warehouseData !== null ? <Grid>
                        <Grid.Col span={6}>
                            <Stack gap={3}>
                                <Title order={6}>Date of Birth
                                </Title>
                                <Text>{warehouseData.name}</Text>
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Stack gap={3}>
                                <Title order={6}>Address
                                </Title>
                                <Text>{warehouseData.address}</Text>
                            </Stack>
                        </Grid.Col>
                    </Grid> : <Text>This user is not yet assigned to a warehouse!</Text>
                }
            </Stack>
        </Container>
    );
}
