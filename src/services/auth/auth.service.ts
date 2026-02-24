import DatabaseService from "../database/database.service.ts";
import { LocalStorage } from "../../enums/localStorage.ts";
import { DatabaseTables } from "../../enums/tables.ts";
import { EncryptionService } from "./encryption.service.ts";

export default class AuthService {
    public async login(email: string, password: string) {
        try {
            const database = DatabaseService.getInstance();

            const { data, error } = await database.getByField(
                DatabaseTables.UserDetails,
                "email",
                email,
            );

            if (error) {
                return {
                    status: false,
                    message: error,
                };
            }

            if (data.length === 0) {
                return {
                    status: false,
                    message: "Cannot find matching user email!",
                };
            }

            if (!data[0].status) {
                return {
                    status: false,
                    message: "User is not activated! Please contact the admin!",
                };
            }

            const encrypted = EncryptionService.getInstance().encryptData(password);
            console.log(encrypted);

            if (data[0].password !== password) {
                return {
                    status: false,
                    message: "Incorrect password!",
                };
            }

            localStorage.setItem(
                LocalStorage.userData,
                JSON.stringify(data[0]),
            );

            return {
                status: true,
                data: data[0],
            };
        } catch (e: any) {
            console.log(e)
            return {
                status: false,
                message: e.toString(),
            };
        }
    }
}
