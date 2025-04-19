import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const body = await request.json();
    const fingerprint = request.headers.get('THALITERA_FINGERPRINT');

    console.log('Admin login request body:', body);
    
    // 确保 backendUrl 格式正确
    const baseUrl = backendUrl?.startsWith('http') 
      ? backendUrl 
      : `http://${backendUrl}`;
    
    // 创建后端请求的 headers 对象
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': '*/*',
    };

    // 如果存在指纹，则转发
    if (fingerprint) {
      headers['THALITERA_FINGERPRINT'] = fingerprint;
      console.log('Forwarding fingerprint:', fingerprint);
    }

    console.log('Forwarding request to backend:', `${baseUrl}/admin/login`);

    // 转发请求到后端
    const response = await fetch(`${baseUrl}/admin/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include', // 添加这一行，确保包含凭据
    });

    console.log('Backend response status:', response.status);

    // 获取响应数据
    let data;
    try {
      data = await response.json();
      console.log('Backend response data:', data);
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      const text = await response.text();
      console.error('Raw response:', text);
      throw new Error('Invalid JSON response from backend');
    }

    // 创建带有后端数据的响应
    const nextResponse = NextResponse.json(data);

    // 如果登录成功，设置会话 cookie
    if (data.code === 200) {
      console.log('Admin login successful, setting cookies');
      
      // 转发后端的 cookies（如果存在）
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        console.log('Backend set-cookie header:', setCookieHeader);
        
        // 分割多个 cookie（如果有）
        const cookies = setCookieHeader.split(/,(?=[^,]*=)/);
        cookies.forEach(cookie => {
          nextResponse.headers.append('Set-Cookie', cookie.trim());
          console.log('Forwarded backend cookie:', cookie.trim().split(';')[0]);
        });
      } else {
        console.log('No backend cookies found');
      }

      // 设置我们自己的会话 cookie
      const sessionId = `${Date.now()}_${fingerprint || 'unknown'}`;
      nextResponse.headers.append(
        'Set-Cookie',
        `THALITERA_SESSION_ID=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
      );
      
      console.log("Admin cookie set:", sessionId);
    } else {
      console.log('Admin login failed with code:', data.code);
    }

    return nextResponse;
  } catch (error) {
    console.error('Admin login error:', error);
    
    return NextResponse.json(
      {
        code: 500,
        message: "An error occurred during admin login",
        data: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, THALITERA_FINGERPRINT',
      'Access-Control-Max-Age': '86400',
    },
  });
}