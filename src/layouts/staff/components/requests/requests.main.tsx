import {LoadingOverlay, Stack, Title} from "@mantine/core";
import {useEffect, useState} from "react";
import StaffRequestModal from "./request.modal.tsx";

export default function StaffRequestsLayout() {
    const [isLoading, setIsLoading] = useState(false);

    const [isOpenModal, setIsOpenModal] = useState(false);

    useEffect(() => {
        (async() => await fetchRequests())();
    }, [])

    async function fetchRequests() {
        setIsLoading(true);
        try {

        } catch (e) {

        }
        setIsLoading(false);
    }

    function handleCloseModal() {
        setIsOpenModal(false)
    }

    return (
        <Stack pt={"lg"} pl={"sm"}>
            <LoadingOverlay
                visible={isLoading}
                overlayProps={{ radius: "sm", blur: 2 }}
            />

            <Title>Requests</Title>

            <StaffRequestModal open={isOpenModal} refresh={fetchRequests} close={handleCloseModal} />
        </Stack>
    )
}