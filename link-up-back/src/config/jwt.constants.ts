import * as process from "node:process";

export const JWT_CONSTANTS = {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
};