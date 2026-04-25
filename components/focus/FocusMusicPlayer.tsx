'use client';

import { useState } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, Headphones, Search, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const INITIAL_STATIONS = [
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
];

export function FocusMusicPlayer() {
  const [currentStation, setCurrentStation] = useState(INITIAL_STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (data.id) {
        setCurrentStation(data);
        setIsPlaying(true);
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const nextStation = () => {
    // If we are on an initial station, go to next. If searched, go back to lofi
    const index = INITIAL_STATIONS.findIndex(s => s.id === currentStation.id);
    if (index !== -1) {
      setCurrentStation(INITIAL_STATIONS[(index + 1) % INITIAL_STATIONS.length]);
    } else {
      setCurrentStation(INITIAL_STATIONS[0]);
    }
    setIsPlaying(true);
  };

  const prevStation = () => {
    const index = INITIAL_STATIONS.findIndex(s => s.id === currentStation.id);
    if (index !== -1) {
      setCurrentStation(INITIAL_STATIONS[(index - 1 + INITIAL_STATIONS.length) % INITIAL_STATIONS.length]);
    } else {
      setCurrentStation(INITIAL_STATIONS[0]);
    }
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
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <Input 
            placeholder="Search any song..." 
            className="h-8 bg-white/10 border-white/10 text-white placeholder:text-white/40 pr-8 text-xs focus-visible:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </button>
        </form>

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
            <h4 className="font-bold text-xs truncate">{currentStation.name}</h4>
            <p className="text-[10px] text-indigo-300 truncate">{currentStation.author}</p>
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
              className="h-10 w-10 rounded-full bg-white text-indigo-950 hover:bg-indigo-50 shadow-lg shadow-white/10"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
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

          <div className="flex items-center gap-2 text-[9px] text-indigo-400 justify-center">
            <Volume2 className="h-3 w-3" />
            <span>YouTube Audio Stream</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
