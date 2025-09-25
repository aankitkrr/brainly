// pages/SearchPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, TrendingUp, Clock, X, Loader2, Hash, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription } from '../components/ui/alert';
import { SearchResultCard } from '../components/SearchResultCard';
import { ThemeToggle } from '../components/ThemeToggle';
import { useSearch } from '../hooks/useSearch';
import { useTrendingTags } from '../hooks/useTrendingTags';
import { useNavigate } from 'react-router-dom';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { results, isLoading,  error, hasSearched, search, clearResults } = useSearch();
  const { 
    tags: trendingTags, 
  } = useTrendingTags();

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('search-history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch {
        setSearchHistory([]);
      }
    }
  }, []);

  // Save search history to localStorage
  const saveToHistory = useCallback((searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, 10); // Keep only 10 recent searches
      localStorage.setItem('search-history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    await search(searchQuery);
    saveToHistory(searchQuery);
    setShowSuggestions(false);
  }, [search, saveToHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleTagClick = (tagName: string) => {
    setQuery(tagName);
    handleSearch(tagName);
  };

  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    handleSearch(historyItem);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('search-history');
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-40 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="gap-2 hover:cursor-pointer "
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Semantic Search</h1>
              </div>
            </div>
            
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Search Form */}
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search your knowledge base with AI..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className="pl-10 text-lg h-12"
                    disabled={isLoading}
                  />
                  {query && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setQuery('');
                        clearResults();
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={!query.trim() || isLoading}
                    className={`gap-2 ${isLoading ? "" : "hover:cursor-pointer"}`}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SearchIcon className="h-4 w-4" />
                    )}
                    {isLoading ? 'Searching...' : 'Search'}
                  </Button>
                  
                  {hasSearched && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setQuery('');
                        clearResults();
                      }}
                      className='hover:cursor-pointer'
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </form>

              {/* Search Suggestions */}
              {showSuggestions && (query || searchHistory.length > 0 || trendingTags.length > 0) && (
                <div className="mt-4 space-y-4 border-t border-border pt-4">
                  {/* Recent Searches */}
                  {searchHistory.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Recent Searches
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearHistory}
                          className="text-xs text-muted-foreground"
                        >
                          Clear
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {searchHistory.slice(0, 5).map((item, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer hover:bg-secondary/80"
                            onClick={() => handleHistoryClick(item)}
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Tags */}
                  {/* {trendingTags.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                        <TrendingUp className="h-4 w-4" />
                        Trending Tags
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {trendingTags.slice(0, 10).map((tag) => (
                          <Badge
                            key={tag._id}
                            variant="outline"
                            className="cursor-pointer hover:bg-accent gap-1"
                            onClick={() => handleTagClick(tag.name)}
                          >
                            <Hash className="h-3 w-3" />
                            {tag.name}
                            <span className="text-xs text-muted-foreground ml-1">
                              {tag.uses}
                            </span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )} */}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Alert className="border-destructive/20 bg-destructive/10">
              <AlertDescription className="text-destructive">
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSearch(query)}
                  className="ml-3"
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Search Results */}
          {isLoading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {hasSearched && !isLoading && results.length === 0 && !error && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-muted-foreground">
                  <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No results found</p>
                  <p className="text-sm">
                    Try different keywords or check your spelling. 
                    Search uses AI to find semantically similar content.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Found {results.length} result{results.length !== 1 ? 's' : ''}
                </h2>
                <div className="text-sm text-muted-foreground">
                  Semantic similarity search • AI-powered
                </div>
              </div>
              
              <div className="space-y-4">
                {results.map((result) => (
                  <SearchResultCard
                    key={result._id}
                    result={result}
                    searchQuery={query}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {!hasSearched && !isLoading && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI-Powered Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  This search uses advanced AI to understand the meaning behind your queries, 
                  not just keyword matching.
                </p>
                <ul className="space-y-1 ml-4">
                  <li>• Ask questions like "How to build a React app?"</li>
                  <li>• Search by concepts: "machine learning tutorials"</li>
                  <li>• Find related content even with different wording</li>
                  <li>• Results are ranked by semantic similarity (76%+ threshold)</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;