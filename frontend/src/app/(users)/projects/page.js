import DeploymentTable from "@/components/DeploymentTable"
import ProjectForm from "@/components/ProjectForm"
import ProjectTable from "@/components/ProjectTable"
import { getAllProjects, getDeploymentByProjectId } from "@/utils/serverside/projects"
import { cookies } from "next/headers"
import Link from "next/link"
const API_URL = process.env.NEXT_PUBLIC_API_URL

export const metadata = {
    title: 'Edit Project',
}

export default async function AllProjects () {
 
    const allProjects = await getAllProjects()
    console.log(allProjects)

    return (
        <main className='flex my-5 items-center flex-col'>
            <div className="w-4/5 flex flex-col items-center">            
                    <h1 className="mb-8">View Projects</h1>
                    
                    <Link className="btn bg-yellow-500 px-6 py-2 m-4 inline-block self-end" href="projects/new">Create</Link>
                    {
                    (!allProjects.error ) ? (            
                    <section  className="w-3/4">
                        <ProjectTable defaultData={allProjects}></ProjectTable>
                    </section>) 
                    :
                    <p>
                        You don't have any projects yet!
                    </p>
                    }
            </div>
        </main>
    )
}
