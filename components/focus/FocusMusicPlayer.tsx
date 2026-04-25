'use client';

import { useState } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, Headphones, Search, Loader2, Repeat } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMusic } from '@/components/providers/MusicProvider';

export function FocusMusicPlayer() {
  const { 
    currentStation, 
    isPlaying, 
    isRepeating, 
    isSearching, 
    currentTime, 
    duration, 
    togglePlay, 
    toggleRepeat, 
    nextStation, 
    prevStation, 
    searchSong,
    seek 
  } = useMusic();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchSong(searchQuery);
    setSearchQuery('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
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

        {/* Spotify-style Progress Bar */}
        <div className="space-y-1">
          <input 
            type="range" 
            min="0" 
            max={duration || 100} 
            value={currentTime} 
            onChange={handleSeek}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
          />
          <div className="flex justify-between text-[10px] text-indigo-300 font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-8 w-8 transition-colors ${isRepeating ? 'text-white bg-white/20 rounded-full' : 'text-indigo-200 hover:text-white hover:bg-white/10'}`}
              onClick={toggleRepeat}
              title={isRepeating ? 'Repeat: On' : 'Repeat: Off'}
            >
              <Repeat className="h-4 w-4" />
            </Button>
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
            <span>Global Audio Stream</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
