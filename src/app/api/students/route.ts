
import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), './students.json')

export async function GET() {
  try {
    const fileContents = await fs.readFile(dataFilePath, 'utf8')
    const students = JSON.parse(fileContents)
    return NextResponse.json(students)
  } catch (error) {
    // If file doesn't exist, return empty array
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return NextResponse.json([])
    }
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}
export async function POST(request: Request) {
  try {
    const { students } = await request.json()
    await fs.writeFile(dataFilePath, JSON.stringify(students, null, 2))
    return NextResponse.json({ message: 'Students saved successfully' })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Failed to save students' }, { status: 500 })
  }
}
