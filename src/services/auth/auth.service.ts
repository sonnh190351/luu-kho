import DatabaseService from "../database/database.service.ts";
import { DatabaseTables } from "../../enums/tables.ts";
import {LogService} from "../operations/log.service.ts";
import {LOG_ACTIONS} from "../../enums/log.ts";

export default class AuthService {

    public async login(email: string, password: string) {
        try {
            const database = DatabaseService.getInstance().getDatabase();

            const { data, error } = await database.from(DatabaseTables.UserDetails).select(
                `id,address,avatar,created_at,dob,email,first_name,last_name,password,role,status,updated_at,warehouses(id, name)`
            ).eq("email", email)

            if (error) { return { status: false, message: error }; }

            if (data.length === 0) { return { status: false, message: "Cannot find matching user email!",} }

            if (!data[0].status) {
                return { status: false, message: "User is not activated! Please contact the admin!" };
            }

            if (data[0].password !== password) {
                return { status: false, message: "Incorrect password!" };
            }

            await LogService.getInstance().writeLog(LOG_ACTIONS.LOGIN, `User logged in success: ${email}`)

            return { status: true, data: data[0],
            };

        } catch (e: any) {
            await LogService.getInstance().writeLog( LOG_ACTIONS.LOGIN, `User logged in failed: ${email}. Reason: ${e.toString()}`)
            return {
                status: false,
                message: e.toString(),
            };
        }
    }
}
