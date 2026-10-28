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
import AiCineBotModal from '../AiCineBot/AiCineBotModal'

const NavBar = () => {
    const [showNav, setShowNav] = useState<boolean>(false)
    const [showAiModal, setShowAiModal] = useState<boolean>(false)
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
        <>
            <header className={classnames('header py-3 absolute top-0 left-0 w-full z-10 md:z-[6]', { 'bg-black': darkNav })}>
                <Wrapper className='flex flex-row items-center'>
                    <button className='btn-bars text-4xl text-white mr-4 inline-block md:hidden duration-300 transition-colors hover:text-dark-purple' onClick={(event: MouseEvent) => { event.stopPropagation(); setShowNav(true) }}><HiBars3BottomLeft /></button>
                    <Logo />
                    <nav ref={navRef} className={classnames('menu', { active: showNav })}>
                        <button className='absolute cursor-pointer z-30 right-4 top-4 text-white text-3xl hover:text-dark-purple transition-colors duration-300 md:hidden' onClick={() => setShowNav(false)}><IoMdClose /></button>
                        <NavLink to={"/"} className={({ isActive }) => classnames("menu-items", { active: isActive })} onClick={() => setShowNav(false)}>Home</NavLink>
                        <NavLink to={"/movies"} className={({ isActive }) => classnames("menu-items", { active: isActive })} onClick={() => setShowNav(false)}>Movies</NavLink>
                        <NavLink to={"/tv-series"} className={({ isActive }) => classnames("menu-items", { active: isActive })} onClick={() => setShowNav(false)}>TV-Series</NavLink>
                    </nav>

                    <div className="flex items-center gap-2.5 ml-auto">
                        {/* Quick CineLens AI Trigger on Desktop */}
                        <button
                            type="button"
                            onClick={() => setShowAiModal(true)}
                            title="Open CineLens AI Studio"
                            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black text-white bg-gradient-to-r from-[#451488] via-[#7e22ce] to-[#f59e0b] hover:brightness-110 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer border border-amber-400/30"
                        >
                            <IoSparkles className="text-amber-300 animate-pulse text-xs" />
                            <span>CineLens AI</span>
                        </button>

                        <Link to='/search' className="search-box group w-9 h-9 rounded-full flex justify-center items-center transition duration-300 ease-in-out hover:bg-white bg-white/10">
                            <AiOutlineSearch size={20} className='text-white/50 group-hover:text-gray-500' />
                        </Link>
                    </div>

                </Wrapper>
            </header>

            {/* AI CineBot Modal */}
            <AiCineBotModal
                isOpen={showAiModal}
                onClose={() => setShowAiModal(false)}
            />
        </>
    )
}

export default NavBar
