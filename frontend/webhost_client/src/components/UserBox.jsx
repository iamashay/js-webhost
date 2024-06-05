'use client'
import { useContext } from "react"
import { useSession, useLogout, SessionContext } from "@/utils/SessionProvider"
import UserBoxSkeleton from "./UserBoxSkeleton"
import Link from "next/link"
const DefaultBoxData = () => {
    return <ul>
    <Link href={"/login"}><li>Login</li></Link>
    <Link href={"/register"}><li>Sign Up</li></Link>
    </ul>
}


export default function UserBox() {
    // setInterval(() => console.log(session, status, userData), 1000)
    const user = ""
    const test = useContext(SessionContext)
    console.log(test)
    //console.log(user)
    return (
        <UserBoxSkeleton  className="self-center max-md:absolute max-md:top-1.5 max-md:right-10 max-md:mr-3 flex-shrink" image={""}>
            {
                (user.error) ?
                <DefaultBoxData /> :
                <ul className="text-sm">
                    <li className="text-base">Hi, <span className="font-semibold">{user.username}</span></li>
                    <li className="cursor-pointer"><Link href="/projects">Projects</Link></li>
                    <li onClick={() => useLogout()} className="cursor-pointer">Logout</li>
                </ul>
            }

        </UserBoxSkeleton>
    )
}