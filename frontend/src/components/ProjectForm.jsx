'use client'
import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast'
import OpenLinkIco from '@/assets/open-link.svg'
import Image from 'next/image';
import { useRouter } from 'next-nprogress-bar';
const API_URL = process.env.NEXT_PUBLIC_API_URL
const PROJECT_HOST = process.env.PROJECT_HOST

export default function ProjectForm({projectData, create = true}) {
    const router = useRouter()
    const editorRef = useRef(null);
    const [saving, setSaving] = useState(false)
    const submitPost = async (e) => {
        const savingMsg = toast.loading("Saving your project...")
        e.preventDefault()
        setSaving(true)
        try {
            const formData = new FormData(e.target)
            const body = editorRef?.current?.getContent()
            const formatData = Object.fromEntries(formData.entries())
            // console.log(title, slug, body)
            let formMethod = 'POST'
            if (!create) {
                formatData.projectId = projectData.id
                formMethod = 'PUT'
            }
            console.log(formatData, projectData)
            const sendData = await fetch(`${API_URL}/projects/`, {
                method: formMethod,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                    },
                body: JSON.stringify(formatData),
                credentials: 'include',
            })
            const sendDataJson = await sendData.json()
            toast.dismiss(savingMsg)
            if (!sendData.ok) {
                toast.error(sendDataJson?.error)
            } else {
                toast.success("Project saved!")
                if (create) router.push('/projects/'+sendDataJson?.id)
            }
            
        } catch(e){
            toast.error("Error saving the project")
        } finally {
            toast.dismiss(savingMsg)
            setSaving(false)
        }
        
    }
    if (!create)
        projectData.link = PROJECT_HOST?.replace('<custom>', projectData.slug)

    return (
                <form onSubmit={submitPost} method="post" className='flex flex-col'>
                    {!create && (
                    <div className={`flex gap-4 items-center`}>
                        <label htmlFor="slug" className='w-32'>Project Name</label><a href={projectData.link} className='flex items-center' target='_blank'><span className='flex-grow my-2 p-1 text-sm' type="text" id="slug" name="slug" placeholder='This is your auto generated slug' >{(projectData?.slug)}</span><Image src={OpenLinkIco} alt='Open project link' height={16} width={16}></Image></a>
                    </div>
                    )}
                    <div className='flex gap-4 items-center'>
                        <label htmlFor="gitURL" className='w-32'>Github Link</label><input className='flex-grow border border-gray-300 my-2 p-1 shadow-sm text-sm' type="text" id="gitURL" name="gitURL" placeholder='Your github repository https git link' defaultValue={(projectData?.gitURL)}></input>
                    </div>
                    <div className='flex gap-4 items-center hidden'>
                        <label htmlFor="projectType" className='w-32' >Project Type</label><input className='flex-grow border border-gray-300 my-2 p-1 shadow-sm text-sm' type="text" id="projectType" name="projectType"  defaultValue={(projectData?.projectType)}></input>
                    </div>
                    <div className='flex gap-4 items-center'>
                        <label htmlFor="buildScript" className='w-32'>NPM Build Script</label><input className='flex-grow border border-gray-300 my-2 p-1 shadow-sm text-sm' type="text" id="buildScript" name="buildScript" placeholder='Ex. build or dev (npm run build)' defaultValue={(projectData?.buildScript)}></input>
                    </div> 
                    <div className='flex gap-4 items-center'>
                        <label htmlFor="buildFolder" className='w-32'>Build Folder</label><input className='flex-grow border border-gray-300 my-2 p-1 shadow-sm text-sm' type="text" id="buildFolder" name="buildFolder" placeholder='Folder name where output files are present' defaultValue={(projectData?.buildFolder)}></input>
                    </div>  
                    <button type='submit' disabled={saving} className='self-end my-4 bg-sky-500 hover:bg-sky-700 px-5 py-2 text-sm leading-5 rounded-full font-semibold text-white'>Submit</button>
                </form>
            )
}