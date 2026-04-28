import {LocalStorage} from "../enums/localStorage.ts";
import {USER_ROLES} from "../enums/roles.ts";

const ProtectedRoute = ({ children, role } : { children: any, role: number}) => {

    const cachedData = localStorage.getItem(LocalStorage.userData)

    if(!cachedData) {
        window.location.href = "/login"
        return;
    }

    const cached = JSON.parse(cachedData)

    // Temporary disabled for dev purposes
    if (cached.role !== role) {
        if(cached.role !== USER_ROLES.super_admin) {
            localStorage.setItem(LocalStorage.pendingMessage, "Unauthorized access to this page!")
            localStorage.removeItem(LocalStorage.userData)
            window.location.href = "/login"
        }
    }

    return children;
};

export default ProtectedRoute;
