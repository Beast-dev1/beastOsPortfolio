import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface Song {
  title: string;
  artist: string;
  album: string;
  path: string;
  filename: string;
}

export async function GET() {
  try {
    const musicDir = path.join(process.cwd(), 'public', 'music');
    
    // Check if directory exists
    try {
      await fs.access(musicDir);
    } catch {
      return NextResponse.json([]);
    }
    
    const files = await fs.readdir(musicDir);
    
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];
    
    const songs: Song[] = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return audioExtensions.includes(ext);
      })
      .map((file) => {
        const filePath = path.join(musicDir, file);
        const nameWithoutExt = path.parse(file).name;
        
        // Try to extract artist and title from filename (format: "Title - Artist" or "Title _ Artist")
        let title = nameWithoutExt;
        let artist = 'Unknown Artist';
        
        // Try different separators
        const separators = [' - ', ' _ ', ' – ', ' — '];
        for (const sep of separators) {
          if (nameWithoutExt.includes(sep)) {
            const parts = nameWithoutExt.split(sep);
            if (parts.length >= 2) {
              title = parts[0].trim();
              artist = parts.slice(1).join(sep).trim();
              break;
            }
          }
        }
        
        return {
          title: title || nameWithoutExt,
          artist: artist || 'Unknown Artist',
          album: 'Unknown Album',
          path: `/music/${file}`,
          filename: file,
        };
      });
    
    return NextResponse.json(songs);
  } catch (error) {
    console.error('Error in /api/music:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch music files' },
      { status: 500 }
    );
  }
}


