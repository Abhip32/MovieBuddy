import React from 'react'
import { Link } from 'react-router-dom'
import logo from "../../assets/images/logo.png"

type Props = {}

const Logo = (props: Props) => {
    return (
        <Link to={'/'} className="logo text-2xl xs:text-3xl font-semibold text-white">
            <img src={logo} className='h-[30px]'>
            </img>
        </Link>
    )
}

export default Logo