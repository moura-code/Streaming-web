import axios from "axios";
import { parseCookies } from "nookies";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

const { Authentication: token } = parseCookies();
if (token) api.defaults.headers.Authorization = `${token}`;

export async function recoverUserInfo(cookies?) {
  const authCookie = cookies?.Authentication;
  if (authCookie) api.defaults.headers.Authorization = `${authCookie}`;

  return api.get("/users/me", {
    headers: {
      Cookie: `Authentication=${authCookie}`,
    },
  });
}
