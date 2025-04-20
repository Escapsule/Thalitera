import { NextRequest, NextResponse } from 'next/server';

// 简单的内存缓存，存储验证过的令牌结果
// 结构: { [email:token]: { code: number, message: string, timestamp: string } }
const verifiedTokens = new Map<string, { code: number, message: string, timestamp: string }>();

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    // Get token and email from URL params
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (!token || !email) {
      return NextResponse.json({
        code: 400,
        message: 'Missing token or email parameters',
        data: null,
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }
    
    // 生成缓存键
    const cacheKey = `${email}:${token}`;
    
    // 检查此token是否已被验证过
    const cachedResult = verifiedTokens.get(cacheKey);
    if (cachedResult) {
      console.log('Token already verified, returning cached response:', { token, email, result: cachedResult });
      
      return NextResponse.json({
        code: cachedResult.code,
        message: cachedResult.message,
        data: null,
        timestamp: cachedResult.timestamp,
      }, { 
        status: cachedResult.code === 200 ? 200 : 400 
      });
    }
    
    console.log('New verification request:', { token, email });

    // Forward the verification request to the backend
    const response = await fetch(`${backendUrl}/user/verify?email=${email}&token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Get the response data
    const data = await response.json();
    console.log('Backend verification response:', data);

    // 缓存结果（无论成功或失败）
    verifiedTokens.set(cacheKey, { 
      code: data.code, 
      message: data.message,
      timestamp: data.timestamp || new Date().toISOString()
    });
    
    // 设置过期时间，1小时后从缓存中移除
    setTimeout(() => {
      verifiedTokens.delete(cacheKey);
    }, 60 * 60 * 1000);

    return NextResponse.json(data, { 
      status: data.code === 200 ? 200 : 400 
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      {
        code: 500,
        message: 'An error occurred during email verification',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 