'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Video as VideoIcon,
  Search,
  Maximize2,
} from 'lucide-react';

interface Video {
  title: string;
  path: string;
  filename: string;
}

export default function Video() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fetch videos from API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/video');

        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }

        const data = await response.json();
        setVideos(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Failed to load videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Update video volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  // Handle video change
  useEffect(() => {
    if (currentVideo && videoRef.current) {
      videoRef.current.src = currentVideo.path;
      videoRef.current.load();
      if (isPlaying) {
        videoRef.current.play().catch((error) => {
          console.error('Error playing video:', error);
          setError('Failed to play the video. Please try again.');
        });
      }
    }
  }, [currentVideo, isPlaying]);

  // Handle play/pause state
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch((error) => {
          console.error('Error playing video:', error);
          setError('Failed to play the video. Please try again.');
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handlePlay = (video: Video, index: number) => {
    setCurrentVideo(video);
    setCurrentVideoIndex(index);
    setIsPlaying(true);
    setError(null);
  };

  const handlePlayPause = () => {
    if (!currentVideo && videos.length > 0) {
      // Start playing the first video if no video is selected
      setCurrentVideo(videos[0]);
      setCurrentVideoIndex(0);
      setIsPlaying(true);
    } else if (videoRef.current) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (!duration || Math.abs(videoRef.current.duration - duration) > 1) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleNext = () => {
    if (videos.length > 0 && currentVideoIndex >= 0) {
      const nextIndex = (currentVideoIndex + 1) % videos.length;
      setCurrentVideo(videos[nextIndex]);
      setCurrentVideoIndex(nextIndex);
      setIsPlaying(true);
    }
  };

  const handlePrevious = () => {
    if (videos.length > 0 && currentVideoIndex >= 0) {
      const previousIndex =
        (currentVideoIndex - 1 + videos.length) % videos.length;
      setCurrentVideo(videos[previousIndex]);
      setCurrentVideoIndex(previousIndex);
      setIsPlaying(true);
    }
  };

  const handleEnded = () => {
    handleNext();
  };

  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-sm text-gray-400">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error && videos.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a] text-white">
        <div className="text-center p-6">
          <VideoIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-red-400 mb-2">{error}</p>
          <p className="text-sm text-gray-400">
            Make sure you have video files in the public/video directory
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#1a1a1a] text-white overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Video List */}
        <div className="w-64 border-r border-[#3a3a3a] bg-[#1f1f1f] flex flex-col overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b border-[#3a3a3a]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-[#0078D4] text-sm"
              />
            </div>
          </div>

          {/* Video List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <h2 className="text-sm font-semibold text-gray-400 px-2 mb-2">
                Library ({filteredVideos.length})
              </h2>
              {filteredVideos.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  {searchTerm ? 'No videos found' : 'No videos available'}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredVideos.map((video, index) => {
                    const originalIndex = videos.findIndex(
                      (v) => v.path === video.path
                    );
                    const isActive = currentVideo?.path === video.path;
                    return (
                      <motion.button
                        key={video.path}
                        onClick={() => handlePlay(video, originalIndex)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          isActive
                            ? 'bg-[#0078D4] text-white'
                            : 'hover:bg-[#2a2a2a] text-gray-300'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="font-medium text-sm truncate">
                          {video.title}
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
        <div
          ref={containerRef}
          className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] relative"
        >
          {currentVideo ? (
            <div className="w-full max-w-4xl">
              <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
                <video
                  ref={videoRef}
                  className="w-full h-auto max-h-[70vh]"
                  onEnded={handleEnded}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleTimeUpdate}
                  onError={() => {
                    setError(
                      'An error occurred while playing the video. Please try again.'
                    );
                    setIsPlaying(false);
                  }}
                />
                {!isPlaying && currentVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <button
                      onClick={handlePlayPause}
                      className="w-20 h-20 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
                    >
                      <Play className="w-10 h-10 ml-1 text-white" />
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <h2 className="text-xl font-bold mb-1">{currentVideo.title}</h2>
                {error && (
                  <p className="text-red-400 text-sm mt-2">{error}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <VideoIcon className="w-24 h-24 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-400 mb-2">
                No video selected
              </h2>
              <p className="text-sm text-gray-500">
                Select a video from the library to start playing
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
          {/* Left: Video Info */}
          <div className="flex-1 min-w-0">
            {currentVideo && (
              <div className="truncate">
                <div className="text-sm font-medium truncate">
                  {currentVideo.title}
                </div>
              </div>
            )}
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#2a2a2a] transition-colors"
              disabled={videos.length === 0}
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={handlePlayPause}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-[#0078D4] hover:bg-[#0063b1] transition-colors"
              disabled={videos.length === 0}
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
              disabled={videos.length === 0}
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Volume Control and Fullscreen */}
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
            <button
              onClick={handleFullscreen}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#2a2a2a] transition-colors ml-2"
              disabled={!currentVideo}
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


