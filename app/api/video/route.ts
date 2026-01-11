import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface Video {
  title: string;
  path: string;
  filename: string;
}

export async function GET() {
  try {
    const videoDir = path.join(process.cwd(), 'public', 'video');
    
    // Check if directory exists
    try {
      await fs.access(videoDir);
    } catch {
      return NextResponse.json([]);
    }
    
    const files = await fs.readdir(videoDir);
    
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v'];
    
    const videos: Video[] = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return videoExtensions.includes(ext);
      })
      .map((file) => {
        const nameWithoutExt = path.parse(file).name;
        
        return {
          title: nameWithoutExt || file,
          path: `/video/${file}`,
          filename: file,
        };
      });
    
    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error in /api/video:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch video files' },
      { status: 500 }
    );
  }
}

