import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface Photo {
  title: string;
  path: string;
  filename: string;
}

export async function GET() {
  try {
    const photosDir = path.join(process.cwd(), 'public', 'wallpapers');
    
    // Check if directory exists
    try {
      await fs.access(photosDir);
    } catch {
      return NextResponse.json([]);
    }
    
    const files = await fs.readdir(photosDir);
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    
    const photos: Photo[] = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      })
      .map((file) => {
        const nameWithoutExt = path.parse(file).name;
        
        return {
          title: nameWithoutExt || file,
          path: `/wallpapers/${file}`,
          filename: file,
        };
      });
    
    return NextResponse.json(photos);
  } catch (error) {
    console.error('Error in /api/photos:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

