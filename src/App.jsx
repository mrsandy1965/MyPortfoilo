import React from 'react'
import { Dock, Home, Navbar, Welcome} from '#components'
import { TerminalWindow, SafariWindow, ContactWindow, FinderWindow, ResumeWindow, TxtFileWindow, ImgFileWindow, PhotosWindow } from '#windows'

const App = () => {
  return (
    <main>
      <Navbar />
      <Welcome />
      <Dock />

      <TerminalWindow />
      <SafariWindow />
      <ContactWindow />
      <FinderWindow />
      <ResumeWindow />
      <TxtFileWindow />
      <ImgFileWindow />
      <PhotosWindow />
      <Home />
    </main>
  )
}

export default App
