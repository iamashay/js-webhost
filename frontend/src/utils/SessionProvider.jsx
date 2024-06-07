'use client'
import { createContext, useEffect, useReducer, useState } from 'react'
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL

export const SessionContext = createContext();

let initialData = {
    isAuthenticated: false,
    user: null,
}

const VERIFY_IDENTITY_INTERVAL = 60000

const reducer = (state, action) => {
    switch (action.type) {
        case "LOGIN":
            const data = {
                isAuthenticated: true,
                user: action.payload,
            }
            localStorage.setItem('sesssionData', JSON.stringify(data))
            return data;
            
        case "LOGOUT":
           localStorage.clear();
            return {
                isAuthenticated: false,
                user: null,
            };
        case "VERIFY":
            return {
                isAuthenticated: action.isAuthenticated,
                user: action.payload,
        };
        case "COOKIE":
            return action.payload;
        default:
            return state;
    }
};


const getUserIdentity = async ({dispatchUser, router}) => {

    try {
        const getSession = await fetch(`${PUBLIC_API_URL}/auth/identity`, {
            credentials: 'include',
        })
        //console.log(getSession)
        const jsonBody = await getSession.json()
        const userData = jsonBody?.user
        dispatchUser({
            type: 'VERIFY',
            payload: userData,
            isAuthenticated: true
        })
        if (!userData) throw new Error("No user data found!")
        } catch(e) {
            dispatchUser({
                type: 'LOGOUT',
            })
            router.push('/')
        }
}


export const logoutUser = async ({router, dispatchUser}) => {
    const logoutMsg = toast.loading("Logging out...")
    try {
        const doLogout = await fetch(`${PUBLIC_API_URL}/auth/logout`, {
            method: 'DELETE',
            credentials: 'include',
        })
        //console.log(getSession)
        const jsonBody = await doLogout.json()
        if (!jsonBody?.success) throw new Error("Unknown error occured during logout")
        dispatchUser({
            type: 'LOGOUT'
        })
        router.push('/')
        } catch(e) {
            toast.dismiss(logoutMsg)
            toast.error("Logout failed!")
        } finally {
            toast.dismiss(logoutMsg)
        }
}


const signIn = async (loginData) => {
    const startLogin = await fetch(`${PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData),
        credentials: 'include'
    })
    return startLogin
}

const register = async (data) => {
    const startRegister = await fetch(`${PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: 'include'
    })
    return startRegister
}

export const loginUser = async ({e, setLoading, dispatchUser, router, loginData}) => {
    e.preventDefault()
    setLoading(true)
    const loginMsgId = toast.loading("Logging In")
    try {
        const signInData = await signIn(loginData)
        const signInDataBody = await signInData.json()
        setLoading(false)
        toast.dismiss(loginMsgId)
        console.log(signInDataBody)
        if (signInData?.status !== 200) {
            return toast.error(`${signInDataBody?.error}`)
        }
        dispatchUser({
            type: 'LOGIN',
            payload: signInDataBody.user
        })
        toast.success("Login success! Redirecting...")
        e?.target?.reset()
        return router.push('/')
    } catch (e) {
        toast.error("Some error occured!")
        setLoading(false)
        toast.dismiss(loginMsgId)
    }
}

export const registerUser = async ({e, setLoading, dispatchUser, router}) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.target)
    const formatFormData = Object.fromEntries(formData.entries())
    console.log(e.target, formatFormData)
    const registerMsgId = toast.loading("Creating your account...")
    try {
        const registerResp = await register(formatFormData)
        const registerRespBody = await registerResp.json()
        setLoading(false)
        toast.dismiss(registerMsgId)
        console.log(registerRespBody)
        if (registerResp?.status !== 200) {
            return toast.error(`${registerRespBody?.error}`)
        }
        dispatchUser({
            type: 'LOGIN',
            payload: registerRespBody
        })
        toast.success("Signup success! Redirecting...")
        e?.target?.reset()
        return router.push('/')
    } catch (e) {
        toast.error("Some error occured!")
        setLoading(false)
        toast.dismiss(registerMsgId)
    }
}




export function SessionProvider({children}) {
    const router = useRouter()



    const [userState, dispatchUser] = useReducer(reducer, initialData)

    useEffect(() => {
        const user = localStorage.getItem('sesssionData')
        try {
            if (user) dispatchUser({type: 'COOKIE', payload: JSON.parse(user)})
        } catch (e) {
            console.log("Not a valid user!")
        }
    }, [])


    useEffect(() => {
        const timer = setInterval(() => {
            console.log(userState)
            if (userState?.isAuthenticated) getUserIdentity({dispatchUser, router})
        }, VERIFY_IDENTITY_INTERVAL)
        return () => clearInterval(timer)
    }, [userState])

    return (
        <SessionContext.Provider value={{userState, dispatchUser}}>
            {children}
        </SessionContext.Provider>
    )
}