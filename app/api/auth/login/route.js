import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { password } = await request.json();

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (password === adminPassword) {
      const response = NextResponse.json({ success: true });
      
      // Set an HttpOnly cookie
      response.cookies.set('admin_token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      
      return response;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
