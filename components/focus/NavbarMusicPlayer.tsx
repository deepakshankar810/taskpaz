'use client';

import { useState } from 'react';
import { Play, Pause, SkipForward, Headphones, Search, Loader2, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMusic } from '@/components/providers/MusicProvider';

export function NavbarMusicPlayer() {
  const { currentStation, isPlaying, isRepeating, isSearching, togglePlay, toggleRepeat, nextStation, searchSong } = useMusic();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchSong(query);
    setQuery('');
  };

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-full px-2 py-1 border border-slate-200 dark:border-slate-800">
      {/* Search Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-slate-500 hover:text-blue-500">
            <Search className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2 shadow-xl" align="center">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input 
              placeholder="Search song..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 text-xs"
            />
            <Button type="submit" size="sm" className="h-8 px-2" disabled={isSearching}>
              {isSearching ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Search'}
            </Button>
          </form>
        </PopoverContent>
      </Popover>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

      {/* Info & Controls */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col min-w-[80px] max-w-[120px]">
          <span className="text-[10px] font-bold truncate leading-tight text-slate-700 dark:text-slate-200">
            {currentStation.name}
          </span>
          <span className="text-[8px] truncate leading-tight text-slate-400">
            {currentStation.author}
          </span>
        </div>

        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-7 w-7 rounded-full transition-colors ${isRepeating ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-500 hover:text-blue-500'}`}
            onClick={toggleRepeat}
            title={isRepeating ? 'Repeat: On' : 'Repeat: Off'}
          >
            <Repeat className="h-3.5 w-3.5" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full text-slate-500 hover:text-blue-500"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full text-slate-500 hover:text-blue-500"
            onClick={nextStation}
          >
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Animated bars when playing */}
      {isPlaying && (
        <div className="flex gap-0.5 items-end h-3 px-1">
          <div className="w-0.5 bg-blue-500 animate-music-bar-1"></div>
          <div className="w-0.5 bg-blue-500 animate-music-bar-2"></div>
          <div className="w-0.5 bg-blue-500 animate-music-bar-3"></div>
        </div>
      )}
    </div>
  );
}
