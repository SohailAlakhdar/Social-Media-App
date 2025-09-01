import { hash, compare } from "bcrypt";

export const generateHash = async (
    palaintext: string,
    salt: number = Number(process.env.SALT)
): Promise<string> => {
    return await hash(palaintext, salt);
};

export const compareHash = async (
    palaintext: string,
    hashPassword: string
): Promise<boolean> => {
    return await compare(palaintext, hashPassword);
};
