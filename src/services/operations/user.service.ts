import {LocalStorage} from "../../enums/localStorage.ts";
import {DatabaseTables} from "../../enums/tables.ts";
import type {UserDetails} from "../../models/user.ts";
import {EncryptionService} from "../auth/encryption.service.ts";
import DatabaseService from "../database/database.service.ts";
import {NotificationsService} from "../notifications/notifications.service.ts";

export default class UserService {
    private static instance: UserService;

    private database: DatabaseService;

    private constructor() {
        this.database = DatabaseService.getInstance();
    }

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }

        return UserService.instance;
    }

    public async getCurrentUser(): Promise<UserDetails> {
        const currentUserData = localStorage.getItem(LocalStorage.userData);
        if (!currentUserData) {
            throw "You are not authenticated for this action!";
        }

        const currentUser = JSON.parse(currentUserData) as UserDetails;

        const userDetails = await this.database.getByField(
            DatabaseTables.UserDetails,
            "id",
            currentUser.id,
        );

        if (userDetails.error || !userDetails.data) {
            throw "Failed to fetch user data!";
        }

        if (userDetails.data.length === 0) {
            throw "Cannot find matching user details";
        }

        return userDetails.data[0] as UserDetails;
    }

    public async editUser(id: any, user: any) {
        await this.database.edit(DatabaseTables.Users, id, user);
    }

    public async registerUser(user: any) {
        console.log(user);
        // const currentUser = await this.getCurrentUser();

        // if (currentUser.role < user.role) {
        //     throw "Cannot register user with higher role!";
        // }

        const existingUser = await this.database.isExist(
            DatabaseTables.UserDetails,
            "email",
            user.email,
        );

        if (existingUser) {
            throw `Duplicate email detected!`;
        }

        // const encrypted = EncryptionService.getInstance().encryptData(
        //     user.password!,
        // );
        // user.password = encrypted;

        await this.database.add(DatabaseTables.UserDetails, user);
    }

    public async deleteUser(user: UserDetails) {
        const currentUser = await this.getCurrentUser();

        if (user.id === currentUser.id) {
            NotificationsService.error(
                "Delete User",
                "User cannot delete themselves!",
            );
            return;
        }

        if (currentUser.role < user.role) {
            NotificationsService.error(
                "Delete User",
                "User cannot delete user with higher role!",
            );
            return;
        }

        this.database.edit(DatabaseTables.UserDetails, user.id, {
            status: false,
        });
    }
}
