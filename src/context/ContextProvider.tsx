
import React from 'react'
import { BackdropProvider } from './backdrop/backdrop.context'
import RotatingLoaderProvider from './RotatingLoader/RotatingLoader.context'
import VideoModalProvider from './VideoModal/VideoModal.context'

const ContextProvider = ({ children }: { children: any }) => {
    return (
        <>
            <BackdropProvider>
                        <RotatingLoaderProvider>
                            <VideoModalProvider>
                                {children}
                            </VideoModalProvider>
                        </RotatingLoaderProvider>
            </BackdropProvider>

        </>
    )
}

export default ContextProvider