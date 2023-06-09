import axios from "axios";
import { parseCookies } from "nookies";

const cokkies = parseCookies();

export const api = axios.create({
  withCredentials: true,
});
const { Authentication: token } = cokkies;
if (token) api.defaults.headers.Authorization = `${token}`;

export async function recoverUserInfo(cokkies?) {
  if (cokkies) {
    const { Authentication: token } = cokkies;
    if (token) api.defaults.headers.Authorization = `${token}`;
  }

  return api.get("http://backend:3001/users/me", {
    headers: {
      Cookie: `Authentication=${cokkies.Authentication}`
    },
  });
}
