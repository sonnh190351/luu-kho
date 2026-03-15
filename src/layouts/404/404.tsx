import {Button, Container, Paper, Stack, Text, Title} from "@mantine/core";

export default function ErrorLayout() {
    return (
        <Container
            size={420}
            my={40}
            style={{
                minHeight: "90vh",
                display: "flex",
                alignItems: "center",
            }}>
            <Paper radius="md" p="xl" withBorder style={{ width: "100%" }}>
                <Stack gap="md">
                    {/* Header */}
                    <div style={{ textAlign: "center" }}>
                        <img src={"/logo.png"} width={100} alt={"logo"} />
                        <Title order={1} mt="md">
                            404
                        </Title>
                        <Text c="dimmed" size="md" mt={5}>
                            This page does not exist!
                        </Text>
                        <Button mt={'sm'} onClick={() => {
                            window.location.href = "/login"
                        }}>
                            Return
                        </Button>
                    </div>
                </Stack>
            </Paper>
        </Container>
    )
}