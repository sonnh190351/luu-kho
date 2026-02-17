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

    private openModal(title: string, body: string) {
        modals.openContextModal({
            modal: "details",
            title: title,
            innerProps: {
                ModalBody: body,
            },
            centered: true,
        });
    }

    async showCategoryDetails(id: number) {
        const category = await DatabaseService.getInstance().getByField(
            DatabaseTables.Categories,
            "id",
            String(id),
        );

        if (category.error) {
            NotificationsService.error(
                "Failed to get category details",
                category.error.toString(),
            );
            return;
        }

        if (category.data!.length > 0) {
            this.openModal("Category Details", "Test");
        }
    }
}
