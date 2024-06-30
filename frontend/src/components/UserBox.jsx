'use client'
import { useContext } from "react"
import { logoutUser, SessionContext } from "@/components/SessionProvider"
import UserBoxSkeleton from "./UserBoxSkeleton"
import Link from "next/link"
import { useRouter } from "next/navigation"
const DefaultBoxData = () => {
    return <ul>
    <Link href={"/login"}><li>Login</li></Link>
    <Link href={"/register"}><li>Sign Up</li></Link>
    </ul>
}


export default function UserBox() {
    // setInterval(() => console.log(session, status, userData), 1000)
    const router = useRouter()
    const {userState, dispatchUser} = useContext(SessionContext)
    const {user} = userState
    console.log(userState)
    //console.log(user)
    return (
        <UserBoxSkeleton  className="self-center max-md:absolute max-md:top-1.5 max-md:right-10 max-md:mr-3 flex-shrink" image={""}>
            {
                !(userState?.isAuthenticated) ?
                <DefaultBoxData /> :
                <ul className="text-sm">
                    <li className="text-base">Hi, <span className="font-semibold">{user.username}</span></li>
                    <li className="cursor-pointer"><Link href="/projects">Projects</Link></li>
                    <li onClick={() => {logoutUser({router, dispatchUser})}} className="cursor-pointer">Logout</li>
                </ul>
            }

        </UserBoxSkeleton>
    )
}