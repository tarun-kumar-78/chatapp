import { isAxiosError } from "axios";

export const getErrMessage = (err:unknown) => {
    if (isAxiosError(err))
        return err.response?.data.message || err.message || "Internal Server Error";
    if (err instanceof Error)
        return err.message;
    return "Something went wrong";
}