import { OAuth2Client } from "google-auth-library";
import { ENV } from "./env";

export const client = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);