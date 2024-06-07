'use client'
import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation';


export default function ProjectForm({postData, create}) {
    const router = useRouter()
    const editorRef = useRef(null);
    const [saving, setSaving] = useState(false)
    const submitPost = async (e) => {
        const savingMsg = toast.loading("Saving post...")
        e.preventDefault()
        setSaving(true)
        try {
            const formData = new FormData(e.target)
            const body = editorRef?.current?.getContent()
            const formatData = Object.fromEntries(formData)
            // console.log(title, slug, body)
            let formMethod = 'POST'
            if (!create) {
                formatData.id = postData.id
                formMethod = 'PUT'
            }
            const sendData = await fetch('/api/post', {
                method: formMethod,
                body: JSON.stringify(formatData)
            })
            const sendDataJson = await sendData.json()
            toast.dismiss(savingMsg)
            if (!sendData.ok) {
                toast.error(sendDataJson?.error)
            } else {
                toast.success("Post saved!")
                if (create) router.push('/dashboard/post/edit/'+sendDataJson?.id)
            }
            
        } catch(e){
            toast.error("Error saving the post")
        } finally {
            toast.dismiss(savingMsg)
            setSaving(false)
        }
        
    }

    return (
                <form onSubmit={submitPost} method="post" className='flex flex-col'>
                    <div className='flex gap-4 items-center'>
                        <label htmlFor="gitURL" className='w-32'>Github Link:</label><input className='flex-grow border border-gray-300 my-2 p-1 shadow-sm text-sm' type="text" id="gitURL" name="gitURL" placeholder='Your github repository https git link' defaultValue={(postData?.slug)}></input>
                    </div>
                    <div className='flex gap-4 items-center hidden'>
                        <label htmlFor="projectType" className='w-32' >Project Type:</label><input className='flex-grow border border-gray-300 my-2 p-1 shadow-sm text-sm' type="text" id="projectType" name="projectType"  defaultValue={(postData?.slug)}></input>
                    </div>
                    <div className='flex gap-4 items-center'>
                        <label htmlFor="buildScript" className='w-32'>NPM Build Script:</label><input className='flex-grow border border-gray-300 my-2 p-1 shadow-sm text-sm' type="text" id="buildScript" name="buildScript" placeholder='Ex. build or dev (npm run build)' defaultValue={(postData?.slug)}></input>
                    </div> 
                    <div className='flex gap-4 items-center'>
                        <label htmlFor="buildFolder" className='w-32'>Build Folder:</label><input className='flex-grow border border-gray-300 my-2 p-1 shadow-sm text-sm' type="text" id="buildFolder" name="buildFolder" placeholder='Folder name where output files are present' defaultValue={(postData?.slug)}></input>
                    </div>  
                    <button type='submit' disabled={saving} className='self-end my-4 bg-sky-500 hover:bg-sky-700 px-5 py-2 text-sm leading-5 rounded-full font-semibold text-white'>Submit</button>
                </form>
            )
}