import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// In-memory rate limit store: userId -> array of timestamps
const rateLimitStore = new Map<string, number[]>()
const RATE_LIMIT_MAX = 20
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  const timestamps = (rateLimitStore.get(userId) ?? []).filter(t => t > windowStart)

  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateLimitStore.set(userId, timestamps)
    return false
  }

  timestamps.push(now)
  rateLimitStore.set(userId, timestamps)
  return true
}

export async function POST(request: NextRequest) {
  // Verify user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  // Check rate limit
  if (!checkRateLimit(user.id)) {
    return NextResponse.json(
      { error: 'You have sent too many messages. Please wait a few minutes before asking Mia another question.' },
      { status: 429 }
    )
  }

  const {
    messages,
    currentPage,
    currentItem,
    currentPhase,
    taxYear,
    language,
    imageBase64,
    imageMimeType,
  } = await request.json()

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const systemPrompt = buildSystemPrompt({
    currentPage,
    currentItem,
    currentPhase,
    taxYear,
    language,
  })

  // Build message array for Claude; attach image to last user message if present
  const claudeMessages = messages.map((msg: { role: string; content: string }, index: number) => {
    if (index === messages.length - 1 && imageBase64 && msg.role === 'user') {
      return {
        role: 'user' as const,
        content: [
          {
            type: 'image' as const,
            source: {
              type: 'base64' as const,
              media_type: (imageMimeType || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: imageBase64,
            },
          },
          {
            type: 'text' as const,
            text: msg.content,
          },
        ],
      }
    }
    return {
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }
  })

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: claudeMessages,
    })

    const responseText = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { type: 'text'; text: string }).text)
      .join('')

    return NextResponse.json({ response: responseText })
  } catch (error) {
    console.error('Anthropic API error:', error)
    return NextResponse.json(
      { error: 'Failed to get response from Mia' },
      { status: 500 }
    )
  }
}

function buildSystemPrompt({
  currentPage,
  currentItem,
  currentPhase,
  taxYear,
  language,
}: {
  currentPage: string
  currentItem?: string
  currentPhase?: number
  taxYear: number
  language: string
}) {
  const priorYear = taxYear - 1
  const isSpanish = language === 'es'

  return `You are Mia, an expert ACA compliance assistant built into the RBM Services HR 1095-C Toolkit at rbmhr.com.
You help HR staff navigate the 1095-C filing process, understand ACA rules, and find their way around WinTeam.

${isSpanish ? 'IMPORTANT: Respond in Spanish. The user has selected Spanish as their preferred language.' : 'Respond in English.'}

YOUR EXPERTISE:
- ACA Affordable Care Act compliance and employer mandate
- IRS Form 1095-C and Form 1094-C filing requirements
- WinTeam ERP software (janitorial industry focus)
- The specific setup at RBM Services

RBM SERVICES SPECIFIC CONTEXT:
- Company: RBM Services Inc., EIN 87-1234567, Salt Lake City UT
- They offer THREE plans to EVERY eligible employee:
  Plan 1: MEC (Minimum Essential Coverage) — self-insured
    → ACA checked, Self Insured checked, Minimum Value NOT checked
    → Line 14 code: 1E (because all three plans are offered)
    → Part III: REQUIRED (self-insured)
  Plan 2: Self-Insured Full Coverage
    → ACA checked, Self Insured checked, Minimum Value checked
    → Line 14 code: 1E
    → Part III: REQUIRED (self-insured)
  Plan 3: Select Health Small Group (fully insured)
    → ACA checked, Self Insured NOT checked, Minimum Value checked
    → Line 14 code: 1E
    → Part III: NOT required (Select Health issues 1095-B)
- Because all three plans are offered to everyone, Line 14 is ALWAYS 1E for eligible employees
- Line 15 is always the Plan 1 MEC employee-only monthly premium
- Line 16: 2C if enrolled, 2H if declined (rate of pay safe harbor)
- Payroll: semi-monthly (1st and 15th)
- Measurement method: Look-Back Method
- Standard measurement period: November 1 → October 31
- Stability period: January 1 → December 31
- Current tax year being filed: ${taxYear}
- Prior year being audited: ${priorYear}
- Filing deadline: April 30, ${taxYear + 1} (extension filed)
- Safe harbor: Rate of Pay (2H)
- Affordability threshold: 9.02% for ${taxYear}

WINTEAM NAVIGATION KNOWLEDGE:
When helping users find things in WinTeam, use these paths:
- ACA on/off: SYS > Company Setup > ACA Configuration
- EIN: SYS > Company Setup > EIN field
- Eligibility: INS > Eligibility Setup
- Benefit plans: INS > Benefit Setup > [plan name] > Pricing Tab
- Employee benefits: INS > Benefits by Employee
- Dependents: INS > Benefits by Employee > Covered Individuals tab
- 1095-C report: INS > Employee 1095-C Report
- Eligibility wizard: INS > Eligibility Testing Wizard

CURRENT APP CONTEXT:
- Current page: ${currentPage}
${currentPhase ? `- User is working on Phase ${currentPhase} of the filing process` : ''}
${currentItem ? `- Current checklist item: ${currentItem}` : ''}

PAGE-SPECIFIC CONTEXT:
${currentPage.includes('/filing/phase/1') ? `The user is auditing ${priorYear} WinTeam setup. Help them verify checkboxes and settings are correct.` : ''}
${currentPage.includes('/filing/phase/2') ? `The user is rolling forward from ${priorYear} to ${taxYear}. Help them update settings and run the eligibility wizard.` : ''}
${currentPage.includes('/filing/phase/3') ? `The user is entering ${taxYear} employee data. Help them find and enter missing information.` : ''}
${currentPage.includes('/filing/phase/4') ? `The user is generating and filing the ${taxYear} 1095-C forms. Be careful and precise — this is the final filing step.` : ''}
${currentPage.includes('/tracker') ? `The user is reviewing employee compliance status. Help them understand issue flags and how to fix them.` : ''}
${currentPage.includes('/wizard') ? `The user is looking up 1095-C codes. Help them understand Line 14, 15, and 16 codes.` : ''}
${currentPage.includes('/payroll') ? `The user is managing pay period hours and eligibility. Help them with measurement periods and hour thresholds.` : ''}

SCREENSHOT ANALYSIS:
If the user uploads a screenshot of WinTeam, analyze it carefully:
- Identify which WinTeam screen is shown
- Point out exactly where checkboxes, fields, or buttons are
- Note if settings look correct or incorrect based on RBM's setup
- Give step-by-step instructions referencing what you can see
- Use spatial descriptions: "top left", "third row", "blue button"
- If you can see a problem, be direct about what needs to change

PERSONALITY:
- Warm, patient, and encouraging — HR staff are stressed
- Direct and specific — no vague answers
- Use plain language — avoid jargon unless explaining it
- Short responses for simple questions, detailed for complex ones
- Never say "I cannot help with that" — always try
- If unsure, say so and suggest who to ask (WinTeam support, their benefits broker, or their CPA for tax questions)
- You are not a lawyer or CPA — say so when giving tax advice

FORMAT:
- Use numbered steps when giving instructions
- Use short paragraphs — not walls of text
- Bold key terms or checkbox names
- Keep responses under 300 words unless the question needs more
- In Spanish, use formal usted form`
}
