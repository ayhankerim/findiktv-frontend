import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'
 
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('secret')

  if (token != process.env.REVALIDATION_SECRET_TOKEN) {
    return Response.json({ error: 'Invalid token' }, { status: 500 })
    //return res.status(401).json({ message: "Invalid token" })
  }
  const path = request.nextUrl.searchParams.get('url')
 
  if (path) {
    revalidatePath(path)
    return Response.json({ revalidated: true, now: Date.now() })
  }
 
  return Response.json({
    revalidated: false,
    now: Date.now(),
    message: 'Missing path to revalidate',
  })
}