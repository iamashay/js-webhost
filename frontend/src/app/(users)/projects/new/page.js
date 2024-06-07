import ProjectForm from "@/components/ProjectForm"

export const metadata = {
    title: 'New Project',
}

export default function () {
    return (
        <main className='flex my-5 items-center flex-col'>
            <h1 className="mb-8">New Project</h1>
            <section className="w-3/4">
                <ProjectForm />
            </section>
        </main>
    )
}