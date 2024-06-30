'use client'
import Link from "next/link"
import { deployProject } from "@/utils/clientside/projects"
import { useRouter } from "next/navigation"

export default function DeployButton({projectData}) {
    const router = useRouter() 

    return <Link className="btn bg-yellow-500 px-6 py-2 m-4 inline-block self-end" href="#" onClick={(e) => {e.preventDefault(); deployProject({projectId: projectData.id, router})}}>Deploy</Link>
}