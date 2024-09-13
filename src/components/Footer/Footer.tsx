import React from 'react'
import Wrapper from '../Wrapper/Wrapper'
import { Link } from 'react-router-dom'
import Logo from '../Logo/Logo'

type Props = {}

const Footer = (props: Props) => {
  return (
    <div className='footer text-center bg-black p-8 '>
      <Wrapper>
        <Logo />
      </Wrapper>
    </div>
  )
}

export default Footer