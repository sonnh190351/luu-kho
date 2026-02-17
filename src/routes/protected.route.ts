import {LocalStorage} from "../enums/localStorage.ts";

const ProtectedRoute = ({ children, level = 0 } : { children: any, level?: number}) => {

    const cachedData = localStorage.getItem(LocalStorage.userData)
    if(!cachedData) {
        window.location.href = "/login"
    }

    return children;
};

export default ProtectedRoute;
