import { createContext } from "react";

export const AuthContext = createContext({
  _id: "",
  username: "",
  role: "",
  token: "",
  expire: 0,

  setId(_id: string) {
    this._id = _id;
  },
  setUsername(username: string) {
    this.username = username;
  },
  setRole(role: string) {
    this.role = role;
  },
  setToken(token: string) {
    this.token = token;
  },
  setExpire(expire: number) {
    this.expire = expire;
  },
});
