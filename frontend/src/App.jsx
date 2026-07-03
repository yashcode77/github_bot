import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-8">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-cyan-400">
          Get started with me
        </h1>
        
        <p className="text-xl text-zinc-400">
          Tailwind + shadcn/ui is ready
        </p>

        <button 
          onClick={() => setCount(count + 1)}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all rounded-xl text-lg font-semibold"
        >
          Count is: {count}
        </button>
      </div>
    </div>
  )
}

export default App