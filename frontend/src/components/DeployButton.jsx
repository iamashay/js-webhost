'use client'
import Link from "next/link"
import { deployProject } from "@/utils/clientside/projects"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function DeployButton({projectData}) {
    const router = useRouter() 
    const [loading, setLoading] = useState(false)
    return <Link className={`btn bg-yellow-500 px-6 py-2 m-4 inline-block self-end ${loading ? 'pointer-events-none' : '' } `} href="#" onClick={(e) => {e.preventDefault(); deployProject({projectId: projectData.id, router, setLoading})}}>Deploy</Link>
}