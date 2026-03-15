export enum CommonRequestType {
    RESET_PASSWORD = "Reset Password",
    OTHERS = "Others",
}

export enum ManagerRequestType {
    REPORT_SPOILED = "Spoiled Ingredients",
    REPORT_MISSING = "Missing Ingredients",
    REQUEST_IMPORT = "Request Import Ingredients",
}

export enum StaffRequestType {
    IMPORT = "Import Ingredients",
}

export enum RequestStatus {
    SUBMITTED = "Submitted",
    PROCESSING = "Processing",
    ACCEPTED = "Accepted",
    REJECTED = "Rejected",
}