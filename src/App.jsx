import React from 'react'
import { Dock, Navbar, Welcome} from '#components'
import { TerminalWindow } from '#windows'

const App = () => {
  return (
    <main>
      <Navbar />
      <Welcome />
      <Dock />

      <TerminalWindow />
    </main>
  )
}

export default App
