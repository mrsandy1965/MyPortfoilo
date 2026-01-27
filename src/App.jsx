import React from 'react'
import { Dock, Navbar, Welcome} from '#components'
import { TerminalWindow,SafariWindow } from '#windows'

const App = () => {
  return (
    <main>
      <Navbar />
      <Welcome />
      <Dock />

      <TerminalWindow />
      <SafariWindow />
    </main>
  )
}

export default App
