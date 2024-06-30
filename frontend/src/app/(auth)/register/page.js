import RegisterForm from "@/components/RegisterForm"

export const metadata = {
    title: 'Register',
}

export default function Login() {
    return (
        <main className='flex items-center my-5 flex-col'>
            <h1 className="mb-8">Sign Up</h1>
            <RegisterForm />
        </main>

    )
}