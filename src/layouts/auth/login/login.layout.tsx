import { useState } from "react";
import {
    TextInput,
    PasswordInput,
    Button,
    Paper,
    Title,
    Text,
    Container,
    Checkbox,
    Group,
    Stack,
    LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconMail, IconLock } from "@tabler/icons-react";
import AuthService from "../../../services/auth/auth.service.ts";
import { NotificationsService } from "../../../services/notifications/notifications.service.ts";
import { LocalStorage } from "../../../enums/localStorage.ts";

interface LoginFormValues {
    email: string;
    password: string;
    rememberMe: boolean;
}

export default function LoginLayout() {
    const cachedData = localStorage.getItem(LocalStorage.userData);
    if (cachedData) {
        window.location.href = "/";
    }

    const [isLoading, setIsLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<LoginFormValues>({
        initialValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
        validate: {
            email: (value) => {
                if (!value) return "Email is required";
                if (!/^\S+@\S+\.\S+$/.test(value))
                    return "Invalid email format";
                return null;
            },
            password: (value) => {
                if (!value) return "Password is required";
                if (value.length < 6)
                    return "Password must be at least 6 characters";
                return null;
            },
        },
    });

    const handleSubmit = async (values: LoginFormValues) => {
        setIsLoading(true);

        const authService = new AuthService();
        console.log(values)
        const response = await authService.login(values.email, values.password);
        console.log(response);

        if (response.status) {
            NotificationsService.success(
                "Login success",
                "User will be re-directed after 2 seconds!",
            );
            setTimeout(() => {
                window.location.href = "/";
            }, 2000);
        } else {
            NotificationsService.error("Login Failed", response.message!);
        }

        setIsLoading(false);
    };

    return (
        <Container
            size={420}
            my={40}
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
            }}>
            <LoadingOverlay visible={isLoading} />
            <Paper radius="md" p="xl" withBorder style={{ width: "100%" }}>
                <Stack gap="md">
                    {/* Header */}
                    <div style={{ textAlign: "center" }}>
                        <img src={"/logo.png"} width={100} alt={"logo"} />
                        <Title order={2} mt="md">
                            Welcome Back
                        </Title>
                        <Text c="dimmed" size="sm" mt={5}>
                            Sign in to your account
                        </Text>
                    </div>

                    {/* Form */}
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Stack gap="md">
                            <TextInput
                                label="Email Address"
                                placeholder="you@example.com"
                                leftSection={<IconMail size={16} />}
                                {...form.getInputProps("email")}
                                required
                            />

                            <PasswordInput
                                visible={showPassword}
                                onVisibilityChange={(e) => setShowPassword(e)}
                                label="Password"
                                placeholder="Your password"
                                leftSection={<IconLock size={16} />}
                                {...form.getInputProps("password")}
                                required
                            />

                            <Group justify="space-between" mt="xs">
                                <Checkbox
                                    label="Remember me"
                                    {...form.getInputProps("rememberMe", {
                                        type: "checkbox",
                                    })}
                                />
                            </Group>

                            <Button
                                type="submit"
                                fullWidth
                                mt="md"
                                loading={isLoading}>
                                Sign In
                            </Button>
                        </Stack>
                    </form>
                </Stack>
            </Paper>
        </Container>
    );
}
