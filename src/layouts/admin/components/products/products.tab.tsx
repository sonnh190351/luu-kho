import {LoadingOverlay, Stack, Title} from "@mantine/core";
import {useState} from "react";

export default function ProductsTabs() {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <Stack pt={"lg"} pl={"sm"}>
            <LoadingOverlay
                visible={isLoading}
                overlayProps={{ radius: "sm", blur: 2 }}
            />
            <Title>Products</Title>
        </Stack>
    )
}