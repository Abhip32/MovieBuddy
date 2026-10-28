import React, { MouseEvent, useEffect, useMemo, useRef, useState } from 'react'
import { AiOutlineSearch } from 'react-icons/ai'
import { HiBars3BottomLeft } from 'react-icons/hi2'
import { IoMdClose } from 'react-icons/io'
import { IoSparkles } from 'react-icons/io5'
import Wrapper from '../Wrapper/Wrapper'
import classnames from 'classnames'
import { Link, NavLink, useMatches } from 'react-router-dom'
import { urlMap } from '../../Types/common'
import Logo from '../Logo/Logo'

const NavBar = () => {
    const [showNav, setShowNav] = useState<boolean>(false)
    const navRef = useRef<HTMLDivElement>(null)
    const matches = useMatches()

    const darkNav: boolean = useMemo(() => {
        return matches.some(route => (Object.keys(urlMap) as Array<keyof typeof urlMap>).some(key => route.pathname === urlMap[key]))
    }, [matches])

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (navRef.current && navRef.current.contains(event.target)) return
            setShowNav(false)
        }

        document.addEventListener("click", handleClickOutside)
        return () => {
            document.removeEventListener("click", handleClickOutside)
        }
    }, [])

    return (
        <header className={classnames('header py-3 absolute top-0 left-0 w-full z-10 md:z-[6]', { 'bg-black': darkNav })}>
            <Wrapper className='flex flex-row items-center'>
                <button className='btn-bars text-4xl text-white mr-4 inline-block md:hidden duration-300 transition-colors hover:text-dark-purple' onClick={(event: MouseEvent) => { event.stopPropagation(); setShowNav(true) }}><HiBars3BottomLeft /></button>
                <Logo />
                <nav ref={navRef} className={classnames('menu', { active: showNav })}>
                    <button className='absolute cursor-pointer z-30 right-4 top-4 text-white text-3xl hover:text-dark-purple transition-colors duration-300 md:hidden' onClick={() => setShowNav(false)}><IoMdClose /></button>
                    <NavLink to={"/"} className={({ isActive }) => classnames("menu-items", { active: isActive })} onClick={() => setShowNav(false)}>Home</NavLink>
                    <NavLink to={"/movies"} className={({ isActive }) => classnames("menu-items", { active: isActive })} onClick={() => setShowNav(false)}>Movies</NavLink>
                    <NavLink to={"/tv-series"} className={({ isActive }) => classnames("menu-items", { active: isActive })} onClick={() => setShowNav(false)}>TV-Series</NavLink>
                    <NavLink to={"/cinebot"} className={({ isActive }) => classnames("menu-items flex items-center gap-1.5", { active: isActive })} onClick={() => setShowNav(false)}>
                        <IoSparkles className="text-dark-purple text-xs" />
                        <span>CineBot AI</span>
                    </NavLink>
                </nav>

                <div className="flex items-center gap-2 sm:gap-2.5 ml-auto">
                    {/* Quick CineBot AI Page Link */}
                    <NavLink
                        to="/cinebot"
                        title="Open CineBot AI Film Curator"
                        className={({ isActive }) => classnames(
                            "group flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer border flex-shrink-0",
                            isActive
                                ? "bg-dark-purple text-white border-dark-purple shadow-[0_0_15px_rgba(179,0,255,0.4)]"
                                : "text-white hover:text-dark-purple bg-white/10 hover:bg-white/20 border-white/10 hover:border-dark-purple"
                        )}
                    >
                        <IoSparkles className="text-dark-purple group-hover:text-white transition-colors duration-300 text-xs" />
                        <span className="transition-colors duration-300 group-hover:text-dark-purple">CineBot AI</span>
                    </NavLink>

                    <Link to='/search' className="search-box group w-9 h-9 rounded-full flex justify-center items-center transition duration-300 ease-in-out hover:bg-white bg-white/10 flex-shrink-0">
                        <AiOutlineSearch size={20} className='text-white/50 group-hover:text-gray-500' />
                    </Link>
                </div>

            </Wrapper>
        </header>
    )
}

export default NavBar
