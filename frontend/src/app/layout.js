import BaseHeader from "@/components/BaseHeader"
import '@/app/globals.css'
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "@/components/SessionProvider";
import ProgressBarProvider from "@/components/ProgressBarProvider";

export const metadata = {
  title: "JS Webhosting",
  description: "Host and deploy your JavaScript or Static HTML projects!",
};

const headerData = [
  {
      name: 'Home',
      href: '/',
  },
]

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className={'h-full'}>
      <SessionProvider >
        <Toaster/>
        <BaseHeader headerData={headerData}/>
        {children}
      </SessionProvider>
      <ProgressBarProvider />
      </body>
    </html>
  );
}
