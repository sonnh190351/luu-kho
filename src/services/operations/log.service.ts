import DatabaseService from "../database/database.service.ts";
import {DatabaseTables} from "../../enums/tables.ts";
import {LocalStorage} from "../../enums/localStorage.ts";

export class LogService {

    private static instance: LogService;
    private database: DatabaseService;

    private readonly userData: any;

    private constructor() {
        this.database = DatabaseService.getInstance();

        // Set user data
        const cacheData = localStorage.getItem(LocalStorage.userData);
        this.userData = JSON.parse(cacheData!)
    }

    public static getInstance(): LogService {
        if (!LogService.instance) {
            LogService.instance = new LogService();
        }

        return LogService.instance;
    }
    
    async writeLog(action: string, entry: any) {
        const isLoggedIn = Boolean(this.userData);

        let data = JSON.stringify(entry);

        if(isLoggedIn) {
            data = `[${this.userData.warehouses.name}][${this.userData.email}] User ${this.userData.last_name} ${this.userData.first_name} has executed: [${action}]. Response: ` + data
        }

        await this.database.add(DatabaseTables.Logs, {
            details: data,
        })
    }

}