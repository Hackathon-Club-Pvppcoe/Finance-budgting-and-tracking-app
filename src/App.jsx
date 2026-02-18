import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';

function App() {

  return (
    <MantineProvider>
    <>
     <h1>welcome to our repository boy</h1>
    </>
    </MantineProvider>
  )
}

export default App
