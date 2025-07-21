import axios from "axios";

const authenticationSave = "authenticatedUserHandle"
let userHandle: string | null = localStorage.getItem(authenticationSave)

export function setUserHandle(newUserHandle: string) {
    localStorage.setItem(authenticationSave, newUserHandle)
    userHandle = newUserHandle
    updateHeaders()
}

export function clearUserHandle() {
    localStorage.removeItem(authenticationSave)
    userHandle = null
    updateHeaders()
}

export function getUserHandle() {
    return userHandle
}

export const apiClient = axios.create({
    baseURL: "http://localhost:3000",
    headers: getHeaders()
})

function getHeaders() {
    return userHandle ? {
        Authorization: `userhandle ${userHandle}`,
        "Content-Type": "application/json"
    } : {}
}

function updateHeaders() {
    apiClient.defaults.headers.common = getHeaders()
}