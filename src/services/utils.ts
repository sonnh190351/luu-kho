import { USER_ROLES } from "../enums/roles";
import DOMPurify from "dompurify";

export default class UtilsService {
    static getRoleLevel(role: number) {
        switch (role) {
            case USER_ROLES.admin:
                return "Admin";
            case USER_ROLES.guest:
                return "Guest";
            case USER_ROLES.super_admin:
                return "Super Admin";
            case USER_ROLES.user:
                return "User";
        }
    }

    /**
     * Generates a random hexadecimal string.
     * @param length - The length of the hex string to generate.
     * @returns A random hex string of the specified length.
     */
    static generateRandomHex(length: number): string {
        if (length <= 0) {
            throw new Error("Length must be a positive integer");
        }

        const bytes = new Uint8Array(Math.ceil(length / 2));
        crypto.getRandomValues(bytes);

        let hex = Array.from(bytes, (b) =>
            b.toString(16).padStart(2, "0"),
        ).join("");
        return hex.slice(0, length);
    }

    /**
     * Sanitize string from html tags
     * @param str - String to sanitize
     * @returns A sanitized string
     */
    static sanitize(str: string) {
        return DOMPurify.sanitize(str);
    }

    /**
     * Get avatar URL
     */
    static getAvatarUrl(avatar: string) {
        return `https://pyhfaxqieivmwcayxetg.supabase.co/storage/v1/object/public/user_avatar/${avatar}`
    }
}
