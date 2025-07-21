import axios from "axios";

export const mediaClient = axios.create({
    baseURL: "http://localhost:8003",
})