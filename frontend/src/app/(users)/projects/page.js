import DeploymentTable from "@/components/DeploymentTable"
import ProjectForm from "@/components/ProjectForm"
import ProjectTable from "@/components/ProjectTable"
import { getAllProjects, getDeploymentByProjectId } from "@/utils/serverside/projects"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const metadata = {
    title: 'Edit Project',
}

export default async function AllProjects () {
 
    const allProjects = await getAllProjects()
    console.log(allProjects)

    return (
        <main className='flex my-5 items-center flex-col'>
            <h1 className="mb-8">View Projects</h1>
            {
            (!allProjects.error ) ? (            
            <section className="w-3/4">
                <ProjectTable defaultData={allProjects}></ProjectTable>
            </section>) 
            :
            <p>
                No records found!
            </p>
            }

        </main>
    )
}
