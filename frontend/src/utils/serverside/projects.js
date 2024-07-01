import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const getDeploymentByProjectId = async (projectId) => {
    const deployment = await fetch(`${API_URL}/deployments/all/${projectId}`, {
        headers: {
           'Accept': 'application/json',
           'Cookie': cookies().toString()
        }
    })
    return await deployment.json()
}

export const getDeployment = async (deploymentId) => {
    const deployment = await fetch(`${API_URL}/deployments/${deploymentId}`, {
        headers: {
           'Accept': 'application/json',
           'Cookie': cookies().toString()
        }
    })
    return await deployment.json()
}

export const getAllProjects = async (projectId) => {
    const projects = await fetch(`${API_URL}/projects/`, {
        headers: {
           'Accept': 'application/json',
           'Cookie': cookies().toString()
        }
    })
    return await projects.json()
}