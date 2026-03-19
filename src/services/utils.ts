import {USER_ROLES} from "../enums/roles";
import DOMPurify from "dompurify";
import {RequestStatus} from "../enums/request.ts";
import {ExpiringStatus} from "../enums/data.ts";
import {OrderStatus} from "../enums/orders.ts";

export default class UtilsService {
    static getRoleLevel(role: number) {
        switch (role) {
            case USER_ROLES.manager:
                return "Admin";
            case USER_ROLES.guest:
                return "Guest";
            case USER_ROLES.super_admin:
                return "Super Admin";
            case USER_ROLES.staff:
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

        const hex = Array.from(bytes, (b) =>
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
        const date = new Date();
        return `https://pyhfaxqieivmwcayxetg.supabase.co/storage/v1/object/public/user_avatar/${avatar}?v=${date}`
    }

    static getRequestBadgeColor(status: RequestStatus) {
        switch (status) {
            case RequestStatus.SUBMITTED:
                return "blue"
            case RequestStatus.PROCESSING:
                return "yellow"
            case RequestStatus.ACCEPTED:
                return "green"
            case RequestStatus.REJECTED:
                return "red"
            default:
                return "gray"
        }
    }

    static getExpireBadgeColor(status: ExpiringStatus){
        switch (status) {
            case ExpiringStatus.EXPIRING_SOON:
                return "yellow"
            case ExpiringStatus.EXPIRED:
                return "red"
            case ExpiringStatus.FRESH:
                return "green"
            default:
                return "gray"
        }
    }

    static getOrderBadgeColor(status: OrderStatus){
        switch (status) {
            case OrderStatus.RECEIVED:
                return "blue"
            case OrderStatus.PROCESSING:
                return "yellow"
            case OrderStatus.FINISHED:
                return "green"
            case OrderStatus.CANCELLED:
                return "red"
            default:
                return "gray"
        }
    }

}
