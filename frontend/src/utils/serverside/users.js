import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const isUserValid = async () => {

    const getSession = await fetch(`${API_URL}/auth/identity`, {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Cookie': cookies().toString()
        }
    })
    //console.log(getSession)
    const jsonBody = await getSession.json()
    const userData = jsonBody?.user
    if (userData) return true

}
