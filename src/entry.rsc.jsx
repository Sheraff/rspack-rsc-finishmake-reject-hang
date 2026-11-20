import { renderToReadableStream } from 'react-server-dom-rspack/server.node'
import { Button } from './Button.jsx'

export function renderPage() {
  return renderToReadableStream(<Button />)
}
