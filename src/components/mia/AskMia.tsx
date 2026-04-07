'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  hasImage?: boolean
}

type AttachedImage = {
  base64: string
  mimeType: string
  preview: string
  name: string
}

type AskMiaProps = {
  taxYear: number
  language: 'en' | 'es'
  userName?: string
}

function getPageLabel(pathname: string, language: 'en' | 'es'): string {
  const es = language === 'es'
  if (pathname.includes('/filing/phase/1')) return es ? '📍 Fase 1 — Auditar configuración de WinTeam' : '📍 Phase 1 — Audit WinTeam Setup'
  if (pathname.includes('/filing/phase/2')) return es ? '📍 Fase 2 — Avanzar al nuevo año' : '📍 Phase 2 — Roll Forward to New Year'
  if (pathname.includes('/filing/phase/3')) return es ? '📍 Fase 3 — Ingresar datos de empleados' : '📍 Phase 3 — Enter Employee Data'
  if (pathname.includes('/filing/phase/4')) return es ? '📍 Fase 4 — Generar y presentar formularios' : '📍 Phase 4 — Generate & File Forms'
  if (pathname.includes('/tracker')) return es ? '📍 Rastreador de empleados' : '📍 Employee Tracker'
  if (pathname.includes('/wizard')) return es ? '📍 Asistente de códigos 1095-C' : '📍 1095-C Code Wizard'
  if (pathname.includes('/payroll')) return es ? '📍 Gestión de nóminas' : '📍 Payroll Management'
  return es ? '📍 Panel principal' : '📍 Dashboard'
}

function getSuggestedQuestions(pathname: string, language: 'en' | 'es'): string[] {
  const es = language === 'es'
  if (pathname.includes('/filing/phase/1')) {
    return es
      ? ['¿Dónde está la casilla Self Insured?', '¿Cómo verifico si ACA está habilitado?', '¿Cómo deben verse los ajustes del Plan 1?']
      : ['Where is the Self Insured checkbox?', 'How do I check if ACA is enabled?', 'What should Plan 1 settings look like?']
  }
  if (pathname.includes('/filing/phase/3')) {
    return es
      ? ['¿Dónde ingreso los SSN de dependientes?', '¿Cómo marco a un empleado como rechazado?', '¿Qué pasa si falta el SSN del cónyuge?']
      : ['Where do I enter dependent SSNs?', 'How do I mark an employee as declined?', 'What if a spouse SSN is missing?']
  }
  if (pathname.includes('/tracker')) {
    return es
      ? ['¿Por qué este empleado muestra problemas?', '¿Qué significa "Part III required"?', '¿Cómo corrijo una fecha de estabilidad faltante?']
      : ['Why is this employee showing issues?', 'What does Part III required mean?', 'How do I fix a missing stability date?']
  }
  if (pathname.includes('/wizard')) {
    return es
      ? ['¿Cuál es la diferencia entre 1E y 1F?', '¿Cuándo uso el código 2C?', '¿Cómo calculo la prueba de asequibilidad?']
      : ['What is the difference between 1E and 1F?', 'When do I use code 2C?', 'How do I calculate the affordability test?']
  }
  if (pathname.includes('/payroll')) {
    return es
      ? ['¿Cómo registro a un empleado nuevo?', '¿Qué cuenta como horas ACA?', '¿Cuándo debo enviar una carta de oferta?']
      : ['How do I track a new hire?', 'What counts as ACA hours?', 'When do I need to send an offer letter?']
  }
  return es
    ? ['¿Cuál es la fecha límite de presentación?', 'Explique los códigos de la Línea 14', '¿Qué es la cobertura mínima esencial?']
    : ['What is the filing deadline?', 'Explain Line 14 codes', 'What is Minimum Essential Coverage?']
}

function getWelcomeMessage(language: 'en' | 'es', userName?: string): string {
  const greeting = userName ? (language === 'es' ? `¡Hola, ${userName}!` : `Hi ${userName}!`) : (language === 'es' ? '¡Hola!' : 'Hi!')
  if (language === 'es') {
    return `${greeting} Soy Mia, su asistente de presentación ACA. Puedo ayudarle con:\n• Encontrar cosas en WinTeam\n• Entender los códigos del 1095-C\n• Responder preguntas sobre ACA\n• Analizar capturas de pantalla de WinTeam\n\n¿En qué necesita ayuda?`
  }
  return `${greeting} I'm Mia, your ACA filing assistant. I can help you with:\n• Finding things in WinTeam\n• Understanding 1095-C codes\n• Answering ACA questions\n• Analyzing WinTeam screenshots\n\nWhat do you need help with?`
}

// Simple markdown parser: bold and numbered lists
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: React.ReactNode[] = []
  let listCounter = 0

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ol key={`list-${elements.length}`} style={{ paddingLeft: 20, margin: '4px 0' }}>
          {listItems}
        </ol>
      )
      listItems = []
      listCounter = 0
    }
  }

  lines.forEach((line, i) => {
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)/)
    if (numberedMatch) {
      listCounter++
      listItems.push(
        <li key={i} style={{ marginBottom: 2 }}>
          {parseBold(numberedMatch[2])}
        </li>
      )
    } else {
      flushList()
      if (line.trim() === '') {
        elements.push(<br key={i} />)
      } else {
        elements.push(
          <span key={i} style={{ display: 'block', marginBottom: 2 }}>
            {parseBold(line)}
          </span>
        )
      }
    }
  })

  flushList()
  return elements
}

function parseBold(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

export default function AskMia({ taxYear, language, userName }: AskMiaProps) {
  const pathname = usePathname()
  const phaseMatch = pathname.match(/\/filing\/phase\/(\d)/)
  const currentPhase = phaseMatch ? parseInt(phaseMatch[1]) : undefined

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null)
  const [hasUnread, setHasUnread] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: getWelcomeMessage(language, userName),
          timestamp: new Date(),
        },
      ])
    }
  }, [isOpen, messages.length, language, userName])

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [])

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = overrideText ?? inputValue
    if (!text.trim() && !attachedImage) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      hasImage: !!attachedImage,
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setShowSuggestions(false)

    try {
      const response = await fetch('/api/mia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          currentPage: pathname,
          currentPhase,
          taxYear,
          language,
          imageBase64: attachedImage?.base64 ?? null,
          imageMimeType: attachedImage?.mimeType ?? null,
        }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      const miaMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, miaMessage])
      setAttachedImage(null)

      if (!isOpen) setHasUnread(true)
      scrollToBottom()
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error'
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: errMsg.includes('too many messages')
          ? errMsg
          : (language === 'es'
            ? 'Lo siento, ocurrió un error. Por favor inténtelo de nuevo.'
            : 'Sorry, something went wrong. Please try again.'),
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [inputValue, attachedImage, messages, pathname, currentPhase, taxYear, language, isOpen, scrollToBottom])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleImageUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert(language === 'es' ? 'La imagen debe ser menor de 5MB' : 'Image must be under 5MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      // Send the full data URL — the API route strips the prefix
      setAttachedImage({
        base64: dataUrl,
        mimeType: file.type,
        preview: dataUrl,
        name: file.name,
      })
    }
    reader.readAsDataURL(file)
  }

  const handleOpen = () => {
    setIsOpen(true)
    setHasUnread(false)
    setTimeout(() => inputRef.current?.focus(), 100)
    scrollToBottom()
  }

  const suggestions = getSuggestedQuestions(pathname, language)
  const pageLabel = getPageLabel(pathname, language)
  const tooltipText = language === 'es' ? 'Pregunta a Mia' : 'Ask Mia'

  // Styles as objects to avoid Tailwind conflicts with fixed positioning
  const bubbleStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 9000,
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: '#1a3a5c',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
  }

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 88,
    right: 24,
    zIndex: 9000,
    width: 380,
    height: 520,
    background: 'white',
    border: '1px solid #e2e5ea',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }

  return (
    <>
      {/* Floating bubble button */}
      {!isOpen && (
        <button
          style={bubbleStyle}
          onClick={handleOpen}
          title={tooltipText}
          aria-label={tooltipText}
        >
          <span style={{ color: 'white', fontSize: 22, fontWeight: 600, lineHeight: 1 }}>M</span>
          {hasUnread && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#ef4444',
                border: '2px solid white',
              }}
            />
          )}
        </button>
      )}

      {/* Open bubble (minimized state shows button) */}
      {isOpen && (
        <button
          style={{ ...bubbleStyle, background: '#1a3a5c' }}
          onClick={() => setIsOpen(false)}
          title={language === 'es' ? 'Minimizar' : 'Minimize'}
          aria-label={language === 'es' ? 'Minimizar Mia' : 'Minimize Mia'}
        >
          <span style={{ color: 'white', fontSize: 22, fontWeight: 600, lineHeight: 1 }}>M</span>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div style={panelStyle}>
          {/* Header */}
          <div
            style={{
              background: '#1a3a5c',
              height: 52,
              borderRadius: '16px 16px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 12px 0 12px',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: '#1a3a5c', fontSize: 14, fontWeight: 700 }}>M</span>
              </div>
              <div>
                <div style={{ color: 'white', fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>Mia</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, lineHeight: 1.2 }}>
                  {language === 'es' ? 'Asistente de presentación ACA' : 'ACA Filing Assistant'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 18,
                  padding: '4px 8px',
                  borderRadius: 4,
                  lineHeight: 1,
                }}
                title={language === 'es' ? 'Minimizar' : 'Minimize'}
              >
                —
              </button>
              <button
                onClick={() => {
                  setIsOpen(false)
                  setMessages([])
                  setShowSuggestions(true)
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 18,
                  padding: '4px 8px',
                  borderRadius: 4,
                  lineHeight: 1,
                }}
                title={language === 'es' ? 'Cerrar y limpiar' : 'Close & clear'}
              >
                ×
              </button>
            </div>
          </div>

          {/* Context bar */}
          <div
            style={{
              background: '#eff6ff',
              height: 28,
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 11, color: '#3b6ea5' }}>{pageLabel}</span>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {messages.map((msg, idx) => (
              <div key={msg.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    gap: 6,
                    alignItems: 'flex-end',
                  }}
                >
                  {msg.role === 'assistant' && (
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: '#1a3a5c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>M</span>
                    </div>
                  )}
                  <div
                    style={{
                      maxWidth: '75%',
                      padding: '8px 12px',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.role === 'user' ? '#1a3a5c' : '#f3f4f6',
                      color: msg.role === 'user' ? 'white' : '#111827',
                      fontSize: 13,
                      lineHeight: 1.5,
                    }}
                  >
                    {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                    {msg.hasImage && (
                      <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>
                        📎 {language === 'es' ? 'Imagen adjunta' : 'Image attached'}
                      </div>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    textAlign: msg.role === 'user' ? 'right' : 'left',
                    fontSize: 10,
                    color: '#9ca3af',
                    marginTop: 2,
                    paddingLeft: msg.role === 'assistant' ? 30 : 0,
                  }}
                >
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                {/* Suggestions below welcome message */}
                {idx === 0 && msg.role === 'assistant' && showSuggestions && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, paddingLeft: 30 }}>
                    {suggestions.map((q, qi) => (
                      <button
                        key={qi}
                        onClick={() => sendMessage(q)}
                        style={{
                          background: 'white',
                          border: '1px solid #d1d5db',
                          borderRadius: 8,
                          padding: '6px 10px',
                          fontSize: 12,
                          color: '#1a3a5c',
                          cursor: 'pointer',
                          textAlign: 'left',
                          lineHeight: 1.3,
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#1a3a5c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>M</span>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: '16px 16px 16px 4px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <TypingDots />
                  <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>
                    {language === 'es' ? 'Mia está pensando...' : 'Mia is thinking...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Attached image preview */}
          {attachedImage && (
            <div
              style={{
                padding: '6px 12px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachedImage.preview}
                alt={attachedImage.name}
                style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
              />
              <span style={{ fontSize: 12, color: '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {attachedImage.name}
              </span>
              <button
                onClick={() => setAttachedImage(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 16, padding: '2px 4px' }}
              >
                ×
              </button>
            </div>
          )}

          {/* Input area */}
          <div
            style={{
              height: 52,
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              padding: '0 8px',
              gap: 6,
              flexShrink: 0,
            }}
          >
            {/* File upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file)
                e.target.value = ''
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
                fontSize: 20,
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
              title={language === 'es' ? 'Adjuntar captura de pantalla' : 'Attach screenshot'}
            >
              📎
            </button>

            {/* Text input */}
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={language === 'es' ? 'Pregunta a Mia...' : 'Ask Mia anything...'}
              rows={1}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: 13,
                lineHeight: 1.5,
                padding: '4px 0',
                fontFamily: 'inherit',
                background: 'transparent',
              }}
            />

            {/* Send button */}
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || (!inputValue.trim() && !attachedImage)}
              style={{
                background: isLoading || (!inputValue.trim() && !attachedImage) ? '#d1d5db' : '#1a3a5c',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                cursor: isLoading || (!inputValue.trim() && !attachedImage) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              title={language === 'es' ? 'Enviar' : 'Send'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function TypingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#9ca3af',
            animation: `mia-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes mia-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }
      `}</style>
    </span>
  )
}
