import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  title: string;
  link: string;
  displayLink: string;
  snippet: string;
  pagemap?: {
    cse_image?: Array<{ src: string }>;
  };
}

interface SearchResponse {
  items?: SearchResult[];
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
  queries?: {
    request?: Array<{ startIndex: number }>;
  };
  error?: {
    message: string;
    code: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const startIndex = (page - 1) * 10 + 1;

    // #region agent log
    const hasApiKey = !!process.env.GOOGLE_API_KEY;
    const hasCxId = !!process.env.GOOGLE_CX_ID;
    console.log('[DEBUG] Server-side environment check:', {
      hasApiKey,
      hasCxId,
      apiKeyLength: process.env.GOOGLE_API_KEY?.length || 0,
      cxIdLength: process.env.GOOGLE_CX_ID?.length || 0,
    });
    // #endregion

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Use server-side environment variables (without NEXT_PUBLIC_ prefix)
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
    const GOOGLE_CX_ID = process.env.GOOGLE_CX_ID || process.env.NEXT_PUBLIC_GOOGLE_CX_ID || '';

    // #region agent log
    console.log('[DEBUG] Before API request:', {
      query,
      page,
      startIndex,
      apiKeyLength: GOOGLE_API_KEY.length,
      cxIdLength: GOOGLE_CX_ID.length,
      hasApiKey: !!GOOGLE_API_KEY,
      hasCxId: !!GOOGLE_CX_ID,
    });
    // #endregion

    if (!GOOGLE_API_KEY || !GOOGLE_CX_ID) {
      // #region agent log
      console.error('[DEBUG] Missing Google API credentials on server:', {
        hasGoogApiKey: !!process.env.GOOGLE_API_KEY,
        hasGoogCxId: !!process.env.GOOGLE_CX_ID,
        hasNextPubApiKey: !!process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        hasNextPubCxId: !!process.env.NEXT_PUBLIC_GOOGLE_CX_ID,
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('CX')),
      });
      // #endregion
      return NextResponse.json(
        {
          error: 'Google Search API is not configured. Please set GOOGLE_API_KEY and GOOGLE_CX_ID (or NEXT_PUBLIC_GOOGLE_API_KEY and NEXT_PUBLIC_GOOGLE_CX_ID) environment variables in your deployment platform and redeploy.',
          code: 'MISSING_CREDENTIALS',
          details: {
            hasGoogApiKey: !!process.env.GOOGLE_API_KEY,
            hasGoogCxId: !!process.env.GOOGLE_CX_ID,
            hasNextPubApiKey: !!process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
            hasNextPubCxId: !!process.env.NEXT_PUBLIC_GOOGLE_CX_ID,
          },
        },
        { status: 500 }
      );
    }

    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX_ID}&q=${encodeURIComponent(query)}&start=${startIndex}`;

    // #region agent log
    console.log('[DEBUG] Making API request to Google:', {
      urlPreview: apiUrl.substring(0, 100) + '...',
    });
    // #endregion

    const response = await fetch(apiUrl);

    // #region agent log
    console.log('[DEBUG] API response status:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });
    // #endregion

    if (!response.ok) {
      // #region agent log
      console.error('[DEBUG] API response not OK:', {
        status: response.status,
        statusText: response.statusText,
      });
      // #endregion
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: `Search API error: ${response.statusText}`,
          details: errorText,
          code: response.status,
        },
        { status: response.status }
      );
    }

    const data: SearchResponse = await response.json();

    // #region agent log
    console.log('[DEBUG] API response parsed:', {
      hasError: !!data.error,
      errorCode: data.error?.code,
      errorMessage: data.error?.message,
      hasItems: !!data.items,
      itemsCount: data.items?.length || 0,
    });
    // #endregion

    if (data.error) {
      // #region agent log
      console.error('[DEBUG] API error in response:', {
        errorCode: data.error.code,
        errorMessage: data.error.message,
      });
      // #endregion
      return NextResponse.json(
        {
          error: data.error.message || 'Search API error',
          code: data.error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    // #region agent log
    console.error('[DEBUG] Search error caught:', {
      errorMessage: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    });
    // #endregion
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred while searching',
      },
      { status: 500 }
    );
  }
}

