import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types.ts";
import type { DatabaseTables } from "../../enums/tables.ts";

const supabaseUrl = import.meta.env.VITE_APP_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

export default class DatabaseService {
    private static instance: DatabaseService;

    private readonly database: SupabaseClient;

    private constructor() {
        this.database = createClient<Database>(supabaseUrl, supabaseKey);
    }

    public getDatabase(): SupabaseClient {
        return this.database;
    }

    public static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    public async isExist(table: DatabaseTables, column: string, value: any) {
        const result = await this.database
            .from(table)
            .select()
            .eq(column, value);

        if (result.error) {
            throw result.error;
        }

        return result.data.length > 0;
    }

    public getAll(table: DatabaseTables) {
        return this.database.from(table).select();
    }

    public async getByField(table: DatabaseTables, column: string, value: any) {
        return this.database.from(table).select().eq(column, value);
    }

    public async add(table: DatabaseTables, data: any) {
        return await this.database.from(table).insert(data);
    }

    public async delete(table: DatabaseTables, id: any) {
        await this.database.from(table).delete().eq("id", id);
    }

    public async edit(table: DatabaseTables, id: any, data: any) {
        await this.database.from(table).update(data).eq("id", id);
    }
}
