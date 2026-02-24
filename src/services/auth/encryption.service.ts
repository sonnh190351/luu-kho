import * as CryptoJS from "crypto-js";

const secretKey = import.meta.env.VITE_APP_ENCRYPT_KEY;

export class EncryptionService {
    private static instance: EncryptionService;

    private constructor() {}

    public static getInstance() {
        if (!EncryptionService.instance) {
            EncryptionService.instance = new EncryptionService();
        }

        return EncryptionService.instance;
    }

    // Encryption function
    public encryptData = (password: string) => {
        console.log(secretKey)
        return CryptoJS.AES.encrypt(password, secretKey).toString();
    };

    // Decryption function
    public decryptData = (encryptedData: string) => {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (error: any) {
            throw "Decryption failed: " + error.toString();
        }
    };
}
