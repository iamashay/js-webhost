'use client'
import { useState } from "react"
import DropDownIco from '../assets/dropdown-black.svg'
import Link from 'next/link'
function DropDown({name, href, child}) {

    return (
        
            <li className={` h-full group relative cursor-pointer flex items-center hover:border-b-2 border-b-2 border-b-transparent hover:border-b-orange-600 max-md:border-none max-md:block max-md:w-full max-md:text-center max-md:px-8`}>
                <div className="h-full w-full flex justify-center gap-1">
                    {
                        child?.length > 0 ?
                        (
                            <>
                                <Link href={href} className="h-full w-full flex items-center px-4 pr-0" >{name}</Link>
                                <DropDownIco alt='dropdown icon' className="self-center group-hover:rotate-180 transition-all invert inline" width={20} height={20} />
                            </>
                        ) :
                        (   
                            <Link href={href} className="h-full w-full flex items-center px-4" >{name}</Link>
                        )
                    }
                </div>
                {
                child?.length > 0 && 

                <>
                    <ul className={`group-hover:max-h-44 group-hover:visible border-gray-100 border-b border-x max-h-0 invisible overflow-hidden shadow-md max-md:shadow-none absolute transition-all px-3 bg-zinc-100 text-center top-[calc(100%+2px)] right-0 max-md:static`}>
                        {
                        child.map(menu =>
                            <DropDown key={menu.href} name={menu.name} href={menu.href} child={menu.child} />
                        )
                        }
                    </ul>
                </>
                }
            </li>

    )
}

export default function Menu({headerData}){
    const [showMenu, setShowMenu] = useState(false)
    return (
    <>
            <nav>
                <ul className={`${!showMenu ? 'max-md:hidden' : 'max-md:flex'} h-full flex flex-row items-center max-md:flex-col max-md:pt-4`}>
                    { 
                    headerData &&
                    headerData.map(menu => (
                        <DropDown key={menu.href} name={menu.name} href={menu.href} child={menu.child} />
                    ))

                    }
                </ul>
            </nav>
            <span className="absolute right-0 cursor-pointer mr-4 top-3 hidden max-md:inline" onClick={() => {setShowMenu((value)=> !value)}}>
                <div className="border-t-2 border-black w-4 my-1"></div>
                <div className="border-t-2 border-black w-4 my-1"></div>
                <div className="border-t-2 border-black w-4 my-1"></div>
            </span>
    </>
    )
}