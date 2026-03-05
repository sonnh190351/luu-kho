import {LoadingOverlay, Stack, Title} from "@mantine/core";
import {useEffect, useState} from "react";

export default function StaffRequestsLayout() {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        (async() => await fetchLogs())();
    }, [])

    async function fetchLogs() {
        setIsLoading(true);
        try {

        } catch (e) {

        }
        setIsLoading(false);
    }

    return (
        <Stack pt={"lg"} pl={"sm"}>
            <LoadingOverlay
                visible={isLoading}
                overlayProps={{ radius: "sm", blur: 2 }}
            />

            <Title>Requests</Title>
        </Stack>
    )
}