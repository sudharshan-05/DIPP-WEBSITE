import { useEffect } from 'react'
import { client } from '../sanity'

function App() {

  useEffect(() => {

    const getEvents = async () => {

      const query = `*[_type == "event"]`

      const events = await client.fetch(query)

      console.log(events)
    }

    getEvents()

  }, [])

  return (
    <div>
      <h1>DIPP WEBSITE</h1>
    </div>
  )
}

export default App