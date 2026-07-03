import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function App() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState("")

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-amber-400 mb-2">
            shadcn/ui Test
          </h1>
          <p className="text-zinc-400">Everything is working!</p>
        </div>

        {/* Card Component */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Counter Example</CardTitle>
            <CardDescription>
              Using shadcn Button component
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-6xl font-mono font-bold text-white mb-4">
                {count}
              </p>
              <Button 
                onClick={() => setCount(count + 1)}
                size="lg"
                className="text-lg px-8"
              >
                Increment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Input Example */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Form Input</CardTitle>
            <CardDescription>Using shadcn Input + Label</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-zinc-950 border-zinc-700"
              />
            </div>
            {name && (
              <p className="text-green-400 text-sm">
                Hello, {name}! 👋
              </p>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-zinc-500 text-sm">
          If you can see nice cards, buttons, and inputs → shadcn/ui is working correctly ✅
        </p>
      </div>
    </div>
  )
}

export default App