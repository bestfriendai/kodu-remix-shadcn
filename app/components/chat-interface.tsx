import { useState } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatInterfaceProps {
  onSuggestion?: (suggestion: string) => void
}

export function ChatInterface({ onSuggestion }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      })

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])

      if (data.suggestion && onSuggestion) {
        onSuggestion(data.suggestion)
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-96 flex flex-col p-4 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 border-slate-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-50">AI Assistant</h3>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-slate-400 text-sm">
              Ask me anything about your trip!
            </div>
          ) : (
            messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-slate-50 text-slate-900'
                      : 'bg-slate-800 text-slate-50'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 rounded-lg px-3 py-2">
                <p className="text-sm text-slate-50">Thinking...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex gap-2 mt-4">
        <Input
          placeholder="Ask anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={isLoading}>
          Send
        </Button>
      </div>
    </Card>
  )
}