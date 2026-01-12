'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Music as MusicIcon,
  Search,
} from 'lucide-react';

interface Song {
  title: string;
  artist: string;
  album: string;
  path: string;
  filename: string;
}

export default function Music() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch songs from API
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/music');

        if (!response.ok) {
          throw new Error('Failed to fetch songs');
        }

        const data = await response.json();
        setSongs(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching songs:', error);
        setError('Failed to load songs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  // Update audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle song change
  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.path;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error);
          setError('Failed to play the song. Please try again.');
        });
      }
    }
  }, [currentSong]);

  // Handle play/pause state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error);
          setError('Failed to play the song. Please try again.');
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handlePlay = (song: Song, index: number) => {
    setCurrentSong(song);
    setCurrentSongIndex(index);
    setIsPlaying(true);
    setError(null);
  };

  const handlePlayPause = () => {
    if (!currentSong && songs.length > 0) {
      // Start playing the first song if no song is selected
      setCurrentSong(songs[0]);
      setCurrentSongIndex(0);
      setIsPlaying(true);
    } else if (audioRef.current) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!duration || Math.abs(audioRef.current.duration - duration) > 1) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleNext = () => {
    if (songs.length > 0 && currentSongIndex >= 0) {
      const nextIndex = (currentSongIndex + 1) % songs.length;
      setCurrentSong(songs[nextIndex]);
      setCurrentSongIndex(nextIndex);
      setIsPlaying(true);
    }
  };

  const handlePrevious = () => {
    if (songs.length > 0 && currentSongIndex >= 0) {
      const previousIndex =
        (currentSongIndex - 1 + songs.length) % songs.length;
      setCurrentSong(songs[previousIndex]);
      setCurrentSongIndex(previousIndex);
      setIsPlaying(true);
    }
  };

  const handleEnded = () => {
    handleNext();
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.album.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-sm text-gray-400">Loading music...</p>
        </div>
      </div>
    );
  }

  if (error && songs.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a] text-white">
        <div className="text-center p-6">
          <MusicIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-red-400 mb-2">{error}</p>
          <p className="text-sm text-gray-400">
            Make sure you have music files in the public/music directory
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#1a1a1a] text-white overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Song List */}
        <div className="w-64 border-r border-[#3a3a3a] bg-[#1f1f1f] flex flex-col overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b border-[#3a3a3a]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search songs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-[#0078D4] text-sm"
              />
            </div>
          </div>

          {/* Song List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <h2 className="text-sm font-semibold text-gray-400 px-2 mb-2">
                Library ({filteredSongs.length})
              </h2>
              {filteredSongs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  {searchTerm ? 'No songs found' : 'No songs available'}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredSongs.map((song, index) => {
                    const originalIndex = songs.findIndex(
                      (s) => s.path === song.path
                    );
                    const isActive = currentSong?.path === song.path;
                    return (
                      <motion.button
                        key={song.path}
                        onClick={() => handlePlay(song, originalIndex)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          isActive
                            ? 'bg-[#0078D4] text-white'
                            : 'hover:bg-[#2a2a2a] text-gray-300'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="font-medium text-sm truncate">
                          {song.title}
                        </div>
                        <div className="text-xs truncate opacity-75">
                          {song.artist}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Display Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]">
          {currentSong ? (
            <div className="text-center max-w-md">
              <div className="w-64 h-64 mx-auto mb-8 bg-gradient-to-br from-[#0078D4] to-[#005a9e] rounded-lg flex items-center justify-center shadow-2xl">
                <MusicIcon className="w-32 h-32 text-white/80" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{currentSong.title}</h2>
              <p className="text-gray-400 mb-1">{currentSong.artist}</p>
              <p className="text-sm text-gray-500">{currentSong.album}</p>
              {error && (
                <p className="text-red-400 text-sm mt-4">{error}</p>
              )}
            </div>
          ) : (
            <div className="text-center">
              <MusicIcon className="w-24 h-24 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-400 mb-2">
                No song selected
              </h2>
              <p className="text-sm text-gray-500">
                Select a song from the library to start playing
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Player Controls */}
      <div className="h-24 border-t border-[#3a3a3a] bg-[#1f1f1f] flex flex-col">
        {/* Progress Bar */}
        <div className="px-4 pt-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-12 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-[#3a3a3a] rounded-lg appearance-none cursor-pointer accent-[#0078D4]"
              style={{
                background: `linear-gradient(to right, #0078D4 0%, #0078D4 ${
                  duration ? (currentTime / duration) * 100 : 0
                }%, #3a3a3a ${duration ? (currentTime / duration) * 100 : 0}%, #3a3a3a 100%)`,
              }}
            />
            <span className="text-xs text-gray-400 w-12">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex items-center justify-between px-4">
          {/* Left: Song Info */}
          <div className="flex-1 min-w-0">
            {currentSong && (
              <div className="truncate">
                <div className="text-sm font-medium truncate">
                  {currentSong.title}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {currentSong.artist}
                </div>
              </div>
            )}
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#2a2a2a] transition-colors"
              disabled={songs.length === 0}
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={handlePlayPause}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-[#0078D4] hover:bg-[#0063b1] transition-colors"
              disabled={songs.length === 0}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#2a2a2a] transition-colors"
              disabled={songs.length === 0}
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Volume Control */}
          <div className="flex-1 flex items-center justify-end gap-2">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-[#3a3a3a] rounded-lg appearance-none cursor-pointer accent-[#0078D4]"
              style={{
                background: `linear-gradient(to right, #0078D4 0%, #0078D4 ${
                  volume * 100
                }%, #3a3a3a ${volume * 100}%, #3a3a3a 100%)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onError={() => {
          setError(
            'An error occurred while playing the audio. Please try again.'
          );
          setIsPlaying(false);
        }}
      />
    </div>
  );
}


