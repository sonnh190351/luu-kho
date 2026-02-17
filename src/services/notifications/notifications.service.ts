import {notifications} from "@mantine/notifications";

export class NotificationsService {

    public static success(title: string, message: string) {
        notifications.show({
            color: 'green',
            title: title,
            message: message,
        })
    }

    public static error(title: string, message: string) {
        notifications.show({
            color: 'red',
            title: title,
            message: message,
        })
    }

    public static information(title: string, message: string) {
        notifications.show({
            color: 'blue',
            title: title,
            message: message,
        })
    }

    public static warning(title: string, message: string) {
        notifications.show({
            color: 'yellow',
            title: title,
            message: message,
        })
    }
}