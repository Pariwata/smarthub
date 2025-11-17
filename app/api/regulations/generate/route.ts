import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { industry, region, specificRequirements, customPrompt } = body

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured. Please add it to your .env.local file.' },
        { status: 500 }
      )
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: apiKey,
    })

    // Construct prompt for Claude
    const prompt = customPrompt || `Generate a comprehensive regulation library for the following context:

Industry: ${industry || 'General'}
Region: ${region || 'International'}
Specific Requirements: ${specificRequirements?.join(', ') || 'Standard compliance requirements'}

Please generate 3-5 detailed regulations covering key areas such as:
- Data privacy and protection
- Information security controls
- Change management procedures
- Access control policies
- Incident response procedures

For each regulation, provide:
1. A clear title
2. Category classification
3. Brief description
4. Detailed content with numbered sections

Format the output as a JSON array with the following structure:
[
  {
    "title": "Regulation Title",
    "category": "Category Name",
    "description": "Brief description",
    "content": "Detailed content with sections"
  }
]`

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Extract and parse response
    const responseContent = message.content[0]
    if (responseContent.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Try to extract JSON from the response
    let regulationsData
    try {
      // Look for JSON array in the response
      const jsonMatch = responseContent.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        regulationsData = JSON.parse(jsonMatch[0])
      } else {
        // If no JSON found, return the raw text
        return NextResponse.json(
          {
            error: 'Could not parse regulations from Claude response',
            rawResponse: responseContent.text,
          },
          { status: 500 }
        )
      }
    } catch (parseError) {
      return NextResponse.json(
        {
          error: 'Failed to parse Claude response as JSON',
          rawResponse: responseContent.text,
        },
        { status: 500 }
      )
    }

    // Transform to our Regulation format
    const regulations = regulationsData.map((reg: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      title: reg.title,
      category: reg.category,
      description: reg.description,
      content: reg.content,
      generatedAt: new Date().toISOString(),
      status: 'pending',
      metadata: {
        generatedBy: 'claude-sonnet-4-5',
        version: '1.0',
      },
    }))

    return NextResponse.json({
      regulations,
      generatedAt: new Date().toISOString(),
      requestId: message.id,
    })
  } catch (error) {
    console.error('Error generating regulations:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate regulations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
