import { NextRequest, NextResponse } from 'next/server'

export interface Employee {
  employeeNumber: string
  firstName: string
  lastName: string
  planType: string
  plan: string
}

// In-memory cache (best-effort — resets on cold start)
let cache: { data: Employee[]; fetchedAt: number } | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function fetchFromSheets(): Promise<Employee[]> {
  const SHEET_ID = process.env.GOOGLE_SHEETS_ID
  const API_KEY = process.env.GOOGLE_API_KEY
  const RANGE = 'Sheet1!A2:E'

  if (!SHEET_ID || !API_KEY) {
    throw new Error('GOOGLE_SHEETS_ID and GOOGLE_API_KEY environment variables are not set')
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(RANGE)}?key=${API_KEY}`
  const response = await fetch(url, { cache: 'no-store' })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Google Sheets API error ${response.status}: ${text}`)
  }

  const data = await response.json()
  const rows: string[][] = data.values ?? []

  return rows.map((row) => ({
    employeeNumber: row[0] ?? '',
    firstName: row[1] ?? '',
    lastName: row[2] ?? '',
    planType: row[3] ?? '',
    plan: row[4] ?? '',
  }))
}

export async function GET(request: NextRequest) {
  const refresh = request.nextUrl.searchParams.get('refresh') === 'true'

  if (refresh) {
    cache = null
  }

  const now = Date.now()
  if (cache && now - cache.fetchedAt < CACHE_TTL) {
    return NextResponse.json({ employees: cache.data, cached: true })
  }

  try {
    const employees = await fetchFromSheets()
    cache = { data: employees, fetchedAt: now }
    return NextResponse.json({ employees, cached: false })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch roster'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
