import React from 'react'
import { Dock, Home, Navbar, Welcome} from '#components'
import { TerminalWindow, SafariWindow, ContactWindow, FinderWindow, ResumeWindow, TxtFileWindow, ImgFileWindow, PhotosWindow, AdminWindow } from '#windows'

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
      <AdminWindow />
      <Home />
    </main>
  )
}

export default App
