import React from 'react'

const streaming = ({src}) => {
  return (
    <div>streaming
        <iframe src={src}/>
    </div>
  )
}

export default streaming