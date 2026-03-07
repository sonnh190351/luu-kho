import DatabaseService from "../database/database.service.ts";
import {DatabaseTables} from "../../enums/tables.ts";
import {LocalStorage} from "../../enums/localStorage.ts";

export class LogService {

    private static instance: LogService;

    private database: DatabaseService;

    private constructor() {
        this.database = DatabaseService.getInstance();
    }

    public static getInstance(): LogService {
        if (!LogService.instance) {
            LogService.instance = new LogService();
        }

        return LogService.instance;
    }
    
    async writeLog(entry: any) {
        const cachedData = localStorage.getItem(LocalStorage.userData);
        const isLoggedIn = Boolean(cachedData);

        let data = JSON.stringify(entry);

        if(isLoggedIn) {
            const cached = JSON.parse(cachedData!);
            data = `[${cached.warehouses.name}][${cached.email}] ` + data
        }

        await this.database.add(DatabaseTables.Logs, {
            details: data,
        })
    }
    
    async readAllLogs() {
        
    }
}