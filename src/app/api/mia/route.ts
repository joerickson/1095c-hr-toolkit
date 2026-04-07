import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(userId)

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return true
  }

  if (limit.count >= 20) return false

  limit.count++
  return true
}

export async function POST(request: NextRequest) {
  // Verify authentication
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
      { error: 'Too many messages. Please wait a few minutes.' },
      { status: 429 }
    )
  }

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set')
    return NextResponse.json(
      { error: 'Mia is not configured. Contact your administrator.' },
      { status: 500 }
    )
  }

  let body: any
  try {
    body = await request.json()
  } catch (e) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  const {
    messages = [],
    currentPage = '/',
    currentPhase,
    currentItem,
    taxYear = new Date().getFullYear(),
    language = 'en',
    imageBase64,
    imageMimeType = 'image/jpeg',
  } = body

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  // Build the messages array for Claude
  // Handle image on the last user message
  const claudeMessages = messages.map((msg: any, index: number) => {
    const isLastUserMessage =
      index === messages.length - 1 && msg.role === 'user'

    if (isLastUserMessage && imageBase64) {
      // Strip data URL prefix if present
      // imageBase64 might be "data:image/jpeg;base64,/9j/..."
      // or just the raw base64 string
      const rawBase64 = imageBase64.includes(',')
        ? imageBase64.split(',')[1]
        : imageBase64

      // Validate mime type
      const validMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ]
      const safeMimeType = validMimeTypes.includes(imageMimeType)
        ? imageMimeType
        : 'image/jpeg'

      return {
        role: 'user' as const,
        content: [
          {
            type: 'image' as const,
            source: {
              type: 'base64' as const,
              media_type: safeMimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: rawBase64,
            },
          },
          {
            type: 'text' as const,
            text: msg.content || 'Please analyze this screenshot and help me.',
          },
        ],
      }
    }

    return {
      role: msg.role as 'user' | 'assistant',
      content: msg.content as string,
    }
  })

  // If no messages, create a default one
  if (claudeMessages.length === 0) {
    claudeMessages.push({
      role: 'user' as const,
      content: 'Hello',
    })
  }

  const systemPrompt = buildSystemPrompt({
    currentPage,
    currentItem,
    currentPhase,
    taxYear,
    language,
  })

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: claudeMessages,
    })

    const responseText = response.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => (block as { type: 'text'; text: string }).text)
      .join('')

    return NextResponse.json({ response: responseText })
  } catch (error: any) {
    console.error('Anthropic API error:', {
      message: error.message,
      status: error.status,
      type: error.constructor.name,
    })

    // Return specific error messages for common issues
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Mia is not properly configured. Contact your administrator.' },
        { status: 500 }
      )
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Mia is temporarily busy. Please try again in a moment.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: `Mia encountered an error: ${error.message}` },
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

SCREENSHOT ANALYSIS INSTRUCTIONS:
When you see a WinTeam screenshot:
1. Identify exactly which screen is shown
2. Describe where specific fields or checkboxes are located
3. Note if any settings look correct or incorrect
4. Give numbered steps using visual landmarks visible in the screenshot
5. Be specific: "In your screenshot, I can see the Insurance Benefits 1095-C section in the bottom right corner"

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
