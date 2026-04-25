'use client';

import { useState } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, Headphones } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const STATIONS = [
  {
    id: 'jfKfPfyJRdk', // Lofi Girl
    name: 'Lofi Hip Hop',
    author: 'Lofi Girl',
    thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/0.jpg',
  },
  {
    id: '5yx6BWVnrKY', // Chillhop
    name: 'Chillhop Radio',
    author: 'Chillhop Music',
    thumbnail: 'https://img.youtube.com/vi/5yx6BWVnrKY/0.jpg',
  },
  {
    id: '4xDzrJKXOOY', // Synthwave
    name: 'Synthwave Radio',
    author: 'Lofi Girl',
    thumbnail: 'https://img.youtube.com/vi/4xDzrJKXOOY/0.jpg',
  },
  {
    id: 'S0Q4gqBUs7c', // Coffee Shop
    name: 'Coffee Shop Jazz',
    author: 'BGM channel',
    thumbnail: 'https://img.youtube.com/vi/S0Q4gqBUs7c/0.jpg',
  },
  {
    id: 'nDq9o7V-09w', // Nature / Rain
    name: 'Nature & Rain',
    author: 'Nature Sounds',
    thumbnail: 'https://img.youtube.com/vi/nDq9o7V-09w/0.jpg',
  },
  {
    id: '36YnV9STBqc', // Ambient
    name: 'Deep Focus Ambient',
    author: 'Lofi Records',
    thumbnail: 'https://img.youtube.com/vi/36YnV9STBqc/0.jpg',
  },
  {
    id: 'LpWv6eG_NPI', // Classical
    name: 'Classical Study',
    author: 'Study Music',
    thumbnail: 'https://img.youtube.com/vi/LpWv6eG_NPI/0.jpg',
  },
  {
    id: '9S_B38S0RPo', // White Noise
    name: 'Deep White Noise',
    author: 'Focus Lab',
    thumbnail: 'https://img.youtube.com/vi/9S_B38S0RPo/0.jpg',
  },
];

export function FocusMusicPlayer() {
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const currentStation = STATIONS[currentStationIndex];

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextStation = () => {
    setCurrentStationIndex((prev) => (prev + 1) % STATIONS.length);
    setIsPlaying(true);
  };

  const prevStation = () => {
    setCurrentStationIndex((prev) => (prev - 1 + STATIONS.length) % STATIONS.length);
    setIsPlaying(true);
  };

  return (
    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-indigo-200">
          <Headphones className="h-4 w-4" />
          Focus Radio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Album Art & Station Info */}
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 rounded-lg overflow-hidden shadow-lg border border-white/10 flex-shrink-0">
            <img 
              src={currentStation.thumbnail} 
              alt={currentStation.name}
              className="h-full w-full object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="flex gap-1 items-end h-4">
                  <div className="w-1 bg-white animate-music-bar-1"></div>
                  <div className="w-1 bg-white animate-music-bar-2"></div>
                  <div className="w-1 bg-white animate-music-bar-3"></div>
                </div>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm truncate">{currentStation.name}</h4>
            <p className="text-xs text-indigo-300 truncate">{currentStation.author}</p>
          </div>
        </div>

        {/* Hidden YouTube Iframe */}
        {isPlaying && (
          <div className="hidden">
            <iframe
              key={currentStation.id}
              width="1"
              height="1"
              src={`https://www.youtube.com/embed/${currentStation.id}?autoplay=1&mute=0&controls=0&showinfo=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-indigo-200 hover:text-white hover:bg-white/10"
              onClick={prevStation}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button 
              size="icon" 
              className="h-12 w-12 rounded-full bg-white text-indigo-950 hover:bg-indigo-50 shadow-lg shadow-white/10"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-indigo-200 hover:text-white hover:bg-white/10"
              onClick={nextStation}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-indigo-400 justify-center">
            <Volume2 className="h-3 w-3" />
            <span>Streaming Live from YouTube</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
