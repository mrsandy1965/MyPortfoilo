import React from 'react'
import { Dock, Navbar, Welcome} from '#components'
import { TerminalWindow } from '#windows'
import { Draggable } from 'gsap/Draggable';
import gsap from 'gsap';
gsap.registerPlugin(Draggable);
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
