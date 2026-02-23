import {
    Button,
    Grid,
    Modal,
    Select,
    Stack,
    Text,
    Switch,
    TextInput,
    Divider,
    PasswordInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { UserDetails } from "../../../../models/user.ts";
import { USER_ROLES } from "../../../../enums/roles.ts";
import { DatePickerInput } from "@mantine/dates";
import { useEffect, useState } from "react";
import { NotificationsService } from "../../../../services/notifications/notifications.service.ts";
import UserService from "../../../../services/operations/user.service.ts";
import dayjs from "dayjs";
import { DatabaseTables } from "../../../../enums/tables.ts";
import type { Warehouses } from "../../../../models/warehouses.ts";
import InventoryService from "../../../../services/operations/inventory.service.ts";
import UtilsService from "../../../../services/utils.ts";
import { FormValidationService } from "../../../../services/validatior/form-validation.service.ts";

interface UserDetailsModalProps {
    user: UserDetails | null;
    open: boolean;
    refresh: any;
    close: any;
}

interface UserDetailsFormValues {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    address: string;
    dob: string | null;
    role: number;
    status: boolean;
    warehouse_id: number;
}

export default function UserDetailsModal({
    user,
    open = false,
    close,
    refresh,
}: UserDetailsModalProps) {
    const isEdit = Boolean(user);

    const [showPassword, setShowPassword] = useState<boolean>(false);

    const [warehouses, setWarehouses] = useState<Warehouses[]>([]);

    const form = useForm<UserDetailsFormValues>({
        initialValues: {
            email: "",
            password: "",
            first_name: "",
            last_name: "",
            address: "",
            dob: dayjs().format("YYYY-MM-DD"),
            role: -1,
            status: true,
            warehouse_id: -1,
        },
        validate: {
            first_name: FormValidationService.validateName,
            last_name: FormValidationService.validateName,
            address: FormValidationService.validateAddress,
            email: FormValidationService.validateEmail,
            role: FormValidationService.validateRole,
            password: FormValidationService.validatePassword,
        },
    });

    useEffect(() => {
        if (user) {
            form.setValues({
                email: user.email!,
                password: user.password!,
                first_name: user.first_name!,
                last_name: user.last_name!,
                address: user.address!,
                dob: user.dob,
                role: user.role!,
                status: user.status,
                warehouse_id: user.warehouse_id,
            });
        }
    }, [isEdit]);

    useEffect(() => {
        (async () => await fetchWarehouses())();
    }, []);

    async function fetchWarehouses() {
        try {
            const service = InventoryService.getInstance();
            const data = await service.getAllRows(DatabaseTables.Warehouses);
            setWarehouses(data);
        } catch (e: any) {
            NotificationsService.error("Fetch Warehouses", e.toString());
        }
    }

    async function handleSubmit() {
        try {
            const service = UserService.getInstance();

            if (isEdit) {
                await service.editUser(user!.id, form.getValues());
            } else {
                await service.registerUser(form.getValues());
            }

            refresh();
            handleClose();
            NotificationsService.success(
                `${isEdit ? "Edit" : "Add"} User`,
                `New user has been ${isEdit ? "edit" : "added"} successfully!`,
            );
        } catch (e: any) {
            console.log(e);
            NotificationsService.error(
                `${isEdit ? "Edit" : "Add"} User`,
                e.toString(),
            );
        }
        refresh();
    }

    function handleClose() {
        form.reset();
        close();
    }

    return (
        <Modal
            opened={open}
            onClose={handleClose}
            centered
            size={"60%"}
            title={isEdit ? "Edit User" : "Add User"}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Stack gap={10}>
                            <Text
                                style={{
                                    fontWeight: 700,
                                }}>
                                Authentication Information
                            </Text>
                            <TextInput
                                required
                                {...form.getInputProps("email")}
                                label={"Email"}
                                value={form.values.email}
                                onChange={(e) =>
                                    form.setValues({
                                        email: UtilsService.sanitize(
                                            e.target.value,
                                        ),
                                    })
                                }
                            />
                            <PasswordInput
                                {...form.getInputProps('password')}
                                visible={showPassword}
                                onVisibilityChange={(e) => setShowPassword(e)}
                                required
                                label={"Password"}
                                value={form.values.password}
                                onChange={(e) =>
                                    form.setValues({
                                        password: UtilsService.sanitize(
                                            e.target.value,
                                        ),
                                    })
                                }
                            />
                            <Select
                                {...form.getInputProps('role')}
                                value={String(form.values.role)}
                                onChange={(value) => {
                                    if (value) {
                                        form.setValues({
                                            role: Number(value),
                                        });
                                    }
                                }}
                                required
                                searchable
                                label={"Role"}
                                data={Object.entries(USER_ROLES)
                                    .filter(([_, v]) => v > 0)
                                    .map(([k, v]) => {
                                        return { label: k, value: String(v) };
                                    })}
                            />
                            <Select
                                {...form.getInputProps('warehouse_id')}
                                value={String(form.values.warehouse_id)}
                                onChange={(value) => {
                                    if (value) {
                                        form.setValues({
                                            warehouse_id: Number(value),
                                        });
                                    }
                                }}
                                searchable
                                label={"Warehouse"}
                                data={warehouses.map((s) => {
                                    return {
                                        label: s.name!,
                                        value: String(s.id),
                                    };
                                })}
                            />
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Stack gap={10}>
                            <Text
                                style={{
                                    fontWeight: 700,
                                }}>
                                Personal Information
                            </Text>
                            <Grid>
                                <Grid.Col span={6}>
                                    <TextInput
                                        required
                                        {...form.getInputProps('first_name')}
                                        label={"First Name"}
                                        value={form.values.first_name}
                                        onChange={(e) =>
                                            form.setValues({
                                                first_name:
                                                    UtilsService.sanitize(
                                                        e.target.value,
                                                    ),
                                            })
                                        }
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <TextInput
                                        required
                                        {...form.getInputProps('last_name')}
                                        label={"Last Name"}
                                        value={form.values.last_name}
                                        onChange={(e) =>
                                            form.setValues({
                                                last_name:
                                                    UtilsService.sanitize(
                                                        e.target.value,
                                                    ),
                                            })
                                        }
                                    />
                                </Grid.Col>
                            </Grid>
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
                            <Divider mt="xs" mb="0" />
                            <Text
                                style={{
                                    fontWeight: 700,
                                }}>
                                Account Status
                            </Text>
                            <Switch
                                label={"Activate Status"}
                                checked={form.values.status}
                                onChange={(e) =>
                                    form.setValues({
                                        status: e.currentTarget.checked,
                                    })
                                }
                            />
                        </Stack>
                    </Grid.Col>
                </Grid>

                <Divider mt={"md"} mb="sm" />

                <Button type="submit" fullWidth mt="md">
                    Submit
                </Button>
            </form>
        </Modal>
    );
}
