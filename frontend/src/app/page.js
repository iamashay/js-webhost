'use client'
import { SessionContext } from "@/utils/SessionProvider";
import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";

export default function Home() {
  const {userState} = useContext(SessionContext)
  const user = userState?.user
  return (
    <main className="flex flex-col items-center justify-between p-10">
      {
      (!userState.isAuthenticated) ?
        <section class="hero py-10 text-center">
          <h1 class="text-4xl font-bold">Welcome to JavaScript Web Hosting</h1>
          <p class="text-lg">Host your frontend JavaScript projects or static HTML pages with ease!</p>
          <Link href="register" class="btn bg-yellow-500 px-6 py-2 mt-4 inline-block">Get Started</Link>
        </section>
      :
        <section class="hero py-10 text-center">
          <h1 class="text-4xl font-bold">Welcome, {user.username}!</h1>
          <p class="text-lg">Host your frontend JavaScript projects or static HTML pages with ease!</p>
          <Link href="/projects/new" class="btn bg-yellow-500 px-6 py-2 mt-4 inline-block">Get Started</Link>
        </section>
      }

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
        <div class="bg-white shadow-md rounded-lg p-6">
            <h2 class="text-xl font-medium text-gray-800">Unique Friendly Subdomains</h2>
            <p class="text-gray-600 mt-2">Allow users to have unique friendly subdomains for their projects.</p>
        </div>

        <div class="bg-white shadow-md rounded-lg p-6">
            <h2 class="text-xl font-medium text-gray-800">Host Your ReactJS Projects</h2>
            <p class="text-gray-600 mt-2">Support hosting for ReactJS projects with seamless deployment.</p>
        </div>

        <div class="bg-white shadow-md rounded-lg p-6">
            <h2 class="text-xl font-medium text-gray-800">Host Your Static HTML Projects</h2>
            <p class="text-gray-600 mt-2">Offer hosting solutions for static HTML projects with drag-and-drop file uploads.</p>
        </div>
      </div>

    </main>
  );
}
