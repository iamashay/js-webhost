import DeployButton from "@/components/DeployButton"
import DeploymentTable from "@/components/DeploymentTable"
import ProjectForm from "@/components/ProjectForm"
import { getDeploymentByProjectId } from "@/utils/serverside/projects"
import { cookies } from "next/headers"
const API_URL = process.env.NEXT_PUBLIC_API_URL

export const metadata = {
    title: 'Edit Project',
}



export default async function EditProject ({params}) {
    const {id} = params
    console.log(cookies().toString())
    const getProject = await fetch(`${API_URL}/projects/${id}`, {
     headers: {
        'Accept': 'application/json',
        'Cookie': cookies().toString()
     }
    })
    const projectData = await getProject.json()
    
    const deploymentData = await getDeploymentByProjectId(id)
    //console.log(deploymentData)

    return (
        <main className='flex my-5 items-center flex-col'>
            <div className="w-4/5 flex flex-col items-center">           
                <h1 className="mb-8">Edit Project</h1>
                <DeployButton projectData={projectData}></DeployButton>
                <section className="w-3/4">
                    <ProjectForm projectData={projectData} create={false} />
                </section>
                {!deploymentData.error && (            
                <section className="w-3/4">
                    <DeploymentTable  defaultData={deploymentData}></DeploymentTable>
                </section>)
                }
            </div>
        </main>
    )
}
