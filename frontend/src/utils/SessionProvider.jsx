'use client'
import { createContext, useEffect, useReducer, useState } from 'react'

const {PUBLIC_API_URL} = process.env

export const SessionContext = createContext();

const initialData = {
    isAuthenticated: false,
    user: null,
}


const reducer = (state, action) => {
    switch (action.type) {
        case "LOGIN":
            return {
                isAuthenticated: true,
                user: action.payload,
            };
        case "LOGOUT":
            window.localStorage.clear();
            return {
                isAuthenticated: false,
                user: null,
            };
        case "VERIFY":
            return {
                isAuthenticated: action.isAuthenticated,
                user: action.user,
        };
        default:
            return state;
    }
};


const getUserIdentity = async ({setUser}) => {
    try {
        const getSession = await fetch(`${PUBLIC_API_URL}/auth/identity`, {
            credentials: 'include',
        })
        //console.log(getSession)
        const jsonBody = await getSession.json()
        const userData = jsonBody?.user
        if (!userData) throw new Error("No user data found!")
        setUser(userData)
        } catch(e) {
            setUser({error: e.message})
        }
}

export const useSession = (time = 10000) => {
    const [user, setUser] = useState({})

    useEffect(() => {
        (async () => {
            await getUserIdentity({setUser})
            setInterval(() => getUserIdentity({setUser}), time)
        })()
    }, [])
    return user
}

const logoutUser = async () => {
    try {
        const doLogout = await fetch(`${PUBLIC_API_URL}/auth/logout`, {
            method: 'DELETE',
            credentials: 'include',
        })
        //console.log(getSession)
        const jsonBody = await doLogout.json()
        if (!jsonBody?.success) throw new Error("Unknown error occured during logout")
        window.location.assign('/')
        } catch(e) {

        }
}

export const useLogout = () => {
    logoutUser()
}

export function SessionProvider({children}) {
    const [userState, dispatchUser] = useReducer(reducer, initialData)
    return (
        <SessionContext.Provider value={'{userState, dispatchUser}'}>
            {children}
        </SessionContext.Provider>
    )
}