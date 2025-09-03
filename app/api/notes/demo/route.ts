import { NextRequest, NextResponse } from 'next/server'

// Demo API that works without database
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const spaceType = searchParams.get('spaceType')
  
  // In demo mode, return empty notes
  return NextResponse.json([])
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // In demo mode, just return success
    return NextResponse.json({
      success: true,
      message: 'Note saved to localStorage (demo mode)',
      note: {
        id: Date.now().toString(),
        ...body,
        createdAt: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save note' },
      { status: 500 }
    )
  }
}