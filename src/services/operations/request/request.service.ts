import DatabaseService from "../../database/database.service.ts";
import {LogService} from "../log.service.ts";
import {DatabaseTables} from "../../../enums/tables.ts";
import {LOG_ACTIONS} from "../../../enums/log.ts";
import {NotificationsService} from "../../notifications/notifications.service.ts";

export default class RequestService {

    private static instance: RequestService;
    private readonly database: DatabaseService;

    private constructor() {
        this.database = DatabaseService.getInstance();
    }

    public static getInstance(): RequestService {
        if (!RequestService.instance) {
            RequestService.instance = new RequestService();
        }

        return RequestService.instance;
    }

    public async getRequestDetails() {
        const response = await this.database.getDatabase().from(DatabaseTables.Requests).select(
            `
            id,
            status,
            description,
            type,
            warehouses(
                id,
                name
            ),
            remark,
            requester:users!user_id(id, first_name, last_name, email),
            handler:users!handler_id(id, first_name, last_name, email),
            created_at,
            updated_at
            `
        )

        if (response.error) {
            NotificationsService.error(
                "Inventory Service",
                `Failed to get orders: ${response.error}`,
            );
            return [];
        }

        return response.data;
    }

    public async getRequestDetailsByUserId(user_id: string) {
        const response = await this.database.getDatabase().from(DatabaseTables.Requests).select(
            `
            id,
            status,
            description,
            type,
            warehouses(
                id,
                name
            ),
            remark,
            requester:users!user_id(id, first_name, last_name, email),
            handler:users!handler_id(id, first_name, last_name, email)
            `
        ).eq('user_id', user_id)

        if (response.error) {
            NotificationsService.error(
                "Inventory Service",
                `Failed to get orders: ${response.error}`,
            );
            return [];
        }

        return response.data;
    }

    private async responseLog(response: any, fn_name: string, data: any,) {
        if (response.error) {
            await LogService.getInstance().writeLog(
                fn_name,
                {
                    ...response.error
                }
            )
        } else {
            await LogService.getInstance().writeLog(
                fn_name,
                data
            )
        }
    }

    public async createRequest(request: any): Promise<any> {
        const service = this.database;
        const response = await service.add(DatabaseTables.Requests, request)

        await this.responseLog(response, LOG_ACTIONS.CREATE_REQUEST, request)
        return response
    }

    public async updateRequest(request: any): Promise<any> {
        const service = this.database;
        const response = await service.edit(DatabaseTables.Requests, request.id, request)

        await this.responseLog(response, LOG_ACTIONS.UPDATE_REQUEST, request)
        return response
    }
}