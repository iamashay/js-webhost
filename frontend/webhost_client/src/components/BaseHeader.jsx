import Menu from "./Menu.jsx"
import UserBox from "./UserBox.jsx"
import Logo from '@/assets/logo.png'


export default function Header({headerData}) {
    
    return (
        <header className="w-full border-b-gray-100 border-b shadow	px-9 flex justify-between max-md:flex-col relative mb-2 h-14 ">
            <span className="flex-grow flex items-center">
                <a href='/' className="block w-fit">
                    <img className="cursor-pointer"
                        alt='blogcms logo'
                        src={Logo.src}
                    />
                </a>
            </span>
            <Menu headerData={headerData} className="flex-shrink"></Menu>
            <UserBox />
        </header>
    )
}