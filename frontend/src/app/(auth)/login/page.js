import LoginForm from "@/components/LoginForm"

export const metadata = {
    title: 'Login',
}

export default function Login() {
    return (
        <main className='flex items-center my-5 flex-col'>
            <h1 className="mb-8">Login</h1>
            <LoginForm />
        </main>

    )
}