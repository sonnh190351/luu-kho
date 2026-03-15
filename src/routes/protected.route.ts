import {LocalStorage} from "../enums/localStorage.ts";

const ProtectedRoute = ({ children, role } : { children: any, role: number}) => {

    const cachedData = localStorage.getItem(LocalStorage.userData)

    if(!cachedData) {
        window.location.href = "/login"
        return;
    }

    const cached = JSON.parse(cachedData)

    if (cached.role !== role) {
        localStorage.setItem(LocalStorage.pendingMessage, "Unauthorized access to this page!")
        localStorage.removeItem(LocalStorage.userData)
        window.location.href = "/login"
    }

    return children;
};

export default ProtectedRoute;
