import { useState, useRef, useEffect } from 'react'

const WEBHOOK_URL = 'https://x.pinpal.io/webhook/7b6852f1-942e-43f6-92e4-a649b98cfe99'

const SUGGESTED_QUESTIONS = [
  "What was Devin's last role?",
  "What kind of ASC 606 experience does he have?",
]

function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substr(2, 12) + '_' + Date.now()
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(generateSessionId)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, sessionId }),
      })
      const data = await res.json()
      const answer = data.answer || data.response || data.output || data.text || 'I didn\'t receive a response. Please try again.'
      setMessages(prev => [...prev, { role: 'assistant', content: answer }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong connecting to the server. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setMessages([])
    setInput('')
  }

  return (
    <div className="site">
      {/* Header */}
      <header className="hero">
        <div className="hero-inner">
          <div className="hero-photo-wrap">
            <img
              src="https://media.pinpal.io/da_headshot.png"
              alt="Devin Annis"
              className="hero-photo"
            />
          </div>
          <div className="hero-text">
            <p className="hero-eyebrow">ACCOUNTING • TAX • OPERATIONS</p>
            <h1 className="hero-name">Devin Annis<span className="hero-creds">, CPA, MST</span></h1>
            <p className="hero-tagline">Finance Leader with an AI Focus</p>
            <div className="hero-divider" />
            <p className="hero-bio">
              18 years of progressive accounting experience spanning public company reporting,
              SPAC transactions, manufacturing, and technology hardware &amp; software. I blend
              deep technical expertise in US GAAP with a genuine passion for building AI-powered
              financial systems that scale.
            </p>
          </div>
        </div>
        <div className="hero-scroll-hint">
          <span>Ask me anything below</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </header>

      {/* About strip */}
      <section className="strip">
        <div className="strip-inner">
          <div className="strip-item">
            <span className="strip-num">18</span>
            <span className="strip-label">Years of Experience</span>
          </div>
          <div className="strip-divider" />
          <div className="strip-item">
            <span className="strip-num">7</span>
            <span className="strip-label">Years in Public Accounting</span>
          </div>
          <div className="strip-divider" />
          <div className="strip-item">
            <span className="strip-num">1</span>
            <span className="strip-label">SPAC Merger Completed</span>
          </div>
          <div className="strip-divider" />
          <div className="strip-item">
            <span className="strip-num">∞</span>
            <span className="strip-label">Curiosity for AI &amp; Automation</span>
          </div>
        </div>
      </section>

      {/* Chat section */}
      <section className="chat-section">
        <div className="chat-container">
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-indicator" />
              <div>
                <h2 className="chat-title">Ask Devin's AI</h2>
                <p className="chat-subtitle">Powered by RAG · Responses drawn from Devin's actual experience</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button className="reset-btn" onClick={handleReset} title="Clear conversation">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M5 4V2.5A.5.5 0 015.5 2h5a.5.5 0 01.5.5V4M6 7v5M10 7v5M3 4l.7 8.5a.5.5 0 00.5.5h7.6a.5.5 0 00.5-.5L13 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Clear
              </button>
            )}
          </div>

          {/* Suggested questions */}
          {messages.length === 0 && (
            <div className="suggestions">
              <p className="suggestions-label">Try asking:</p>
              <div className="suggestions-list">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button key={q} className="suggestion-chip" onClick={() => sendMessage(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="messages">
              {messages.map((msg, i) => (
                <div key={i} className={`message message--${msg.role}`}>
                  <div className="message-label">{msg.role === 'user' ? 'You' : 'Devin\'s AI'}</div>
                  <div className="message-bubble">{msg.content}</div>
                </div>
              ))}
              {loading && (
                <div className="message message--assistant">
                  <div className="message-label">Devin's AI</div>
                  <div className="message-bubble message-bubble--loading">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Input */}
          <div className="chat-input-wrap">
            <input
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask about experience, skills, or background..."
              disabled={loading}
            />
            <button
              className="chat-send"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M15.5 9H2.5M9.5 3L15.5 9l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <p className="chat-disclaimer">This AI references Devin's actual professional history. Session ID: <code>{sessionId.slice(0, 20)}…</code></p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Devin Annis · <a href="https://www.linkedin.com/in/devin-annis-0347b513/" target="_blank" rel="noreferrer">LinkedIn</a> · devinannis.com</p>
      </footer>
    </div>
  )
}