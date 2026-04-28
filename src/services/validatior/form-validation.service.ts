import { QUANTITY_TYPES } from "../../enums/data";
import { USER_ROLES } from "../../enums/roles";
import {RequestStatus} from "../../enums/request.ts";

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const NAME_REGEX = /^[\p{L}\p{N}_]+(?:\s[\p{L}\p{N}_]+)*$/u;

export class FormValidationService {
    public static validateItemId(id: number) {
        if (id === -1) {
            return "Please select an item!";
        }
        return null;
    }

    public static validateProductId(id: number) {
        if (id === -1) {
            return "Please select a product!";
        }
        return null;
    }

    public static validateWarehouseId(id: number) {
        if (id === -1) {
            return "Please select a warehouse!";
        }
        return null;
    }

    public static validateSupplierId(id: number) {
        if (id === -1) {
            return "Please select a supplier!";
        }
        return null;
    }

    public static validateCategoryId(id: number) {
        if (id === -1) {
            return "Please select a category!";
        }
        return null;
    }

    public static validateQuantity(quantity: number) {
        if (quantity <= 0) {
            return "Quantity must be greater than 0!";
        }
        return null;
    }


    public static validateName(name: string) {
        if (name.length < 1) {
            return "Name must have at least 1 character!";
        }

        if (name.length > 50) {
            return "Name must not have more than 50 characters!";
        }

        if (!NAME_REGEX.test(name)) {
            return "Name can only contains alphabet character and blank space!";
        }

        return null;
    }

    public static validateDescription(name: string) {
        if (name.length < 1) {
            return "Description must have at least 1 character!";
        }

        if (name.length > 255) {
            return "Description must not have more than 255 characters!";
        }

        return null;
    }

    public static validateRole(role: number) {
        const ROLES = Object.values(USER_ROLES);
        if (!ROLES.includes(role)) {
            return "Invalid role!";
        }

        return null;
    }

    public static validateAddress(address: string) {
        if (address.length < 1) {
            return "Address must have at least 1 character!";
        }

        if (address.length > 255) {
            return "Address must not have more than 255 characters!";
        }

        return null;
    }

    public static validateEmail(email: string) {
        if (!EMAIL_REGEX.test(email)) {
            return `Invalid email address: "${email}"!`;
        }

        return null;
    }

    public static validatePassword(password: string) {
        if(!password) {
            return "Password must be at least 8 characters";
        }

        // 1. Length Check
        if (password.length < 8)
            return "Password must be at least 8 characters";
        if (password.length > 32)
            return "Password must be less than 32 characters";

        // 2. Character Requirements
        if (!/[A-Z]/.test(password))
            return "Uppercase letter missing in password!";
        if (!/[a-z]/.test(password))
            return "Lowercase letter missing in password!";
        if (!/\d/.test(password)) return "Number missing in password!";

        return null;
    }

    public static validateQuantityType(type: string) {
        if (!QUANTITY_TYPES.includes(type)) {
            return "Invalid quantity type!";
        }

        return null;
    }

    public static validateStatus(status: string) {
        if (!Object.values(RequestStatus).includes(status as RequestStatus)) {
            return `Invalid status! ${status}`
        }

        return null
    }
}
