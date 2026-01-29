import React from 'react'
import { Dock, Navbar, Welcome} from '#components'
import { TerminalWindow,SafariWindow, ContactWindow } from '#windows'

const App = () => {
  return (
    <main>
      <Navbar />
      <Welcome />
      <Dock />

      <TerminalWindow />
      <SafariWindow />
      <ContactWindow />
    </main>
  )
}

export default App
