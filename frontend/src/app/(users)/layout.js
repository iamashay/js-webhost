import { isUserValid } from "@/utils/serverside/user";
import { redirect } from 'next/navigation'

export const metadata = {
  title: "User Panel",
  description: "Manage Your Projects",
};

export default async function UserLayout({ children }) {
  const validUser = await isUserValid()
  if (!validUser) redirect('/login')
  return (
    <>
        {children}
    </>
  );
}
