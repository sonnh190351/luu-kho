import { modals } from "@mantine/modals";
import { DatabaseTables } from "../../enums/tables";
import DatabaseService from "../database/database.service";
import { NotificationsService } from "./notifications.service";

export class InformationService {
    private static instance: InformationService;

    private constructor() {}

    public static getInstance() {
        if (!InformationService.instance) {
            InformationService.instance = new InformationService();
        }

        return InformationService.instance;
    }

    public confirm(onConfirm: any) {
        modals.openConfirmModal({
            title: "Are you sure?",
            children:
                "This action cannot be reverted. Are you sure you want to proceed?",
            labels: { confirm: "Confirm", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onConfirm: onConfirm,
            centered: true,
        });
    }

    private openInformationModal(title: string, information: any) {
        modals.openContextModal({
            size: "lg",
            modal: `information`,
            title: title,
            innerProps: {
                information: information,
            },
            centered: true,
        });
    }

    async showItemDetailsById(
        table: DatabaseTables,
        title: string,
        id: number,
    ) {
        const response = await DatabaseService.getInstance().getByField(
            table,
            "id",
            id,
        );

        if (response.error) {
            NotificationsService.error(
                "Failed to get item details",
                response.error.toString(),
            );
            return;
        }

        if (response.data!.length > 0) {
            this.openInformationModal(title, response.data[0]);
        }
    }
}
