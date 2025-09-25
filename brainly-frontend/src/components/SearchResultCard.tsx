// components/SearchResultCard.tsx
import React from 'react';
import { 
  Youtube, 
  Twitter, 
  FileText, 
  ExternalLink,
  Calendar,
  Hash,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { SearchResult } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface SearchResultCardProps {
  result: SearchResult;
  searchQuery?: string;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({ 
  result, 
  searchQuery 
}) => {
  const getTypeIcon = () => {
    switch (result.type) {
      case 'youtube':
        return <Youtube className="h-4 w-4 text-red-500" />;
      case 'tweet':
        return <Twitter className="h-4 w-4 text-blue-500" />;
      case 'note':
        return <FileText className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (result.type) {
      case 'youtube':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300';
      case 'tweet':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300';
      case 'note':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300';
    }
  };

  const highlightText = (text: string, query?: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const formatScore = (score: number) => {
    return Math.round(score * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 dark:text-green-400';
    if (score >= 0.8) return 'text-blue-600 dark:text-blue-400';
    if (score >= 0.76) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 mb-2">
            {getTypeIcon()}
            <Badge variant="outline" className={getTypeColor()}>
              {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Zap className="h-3 w-3" />
              <span className={`font-medium ${getScoreColor(result.score)}`}>
                {formatScore(result.score)}%
              </span>
            </div>
          </div>
          
          {result.link && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(result.link, '_blank')}
              className="h-8 w-8 p-0"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <h3 className="text-lg font-semibold leading-tight">
          {highlightText(result.title, searchQuery)}
        </h3>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Tags */}
          {Array.isArray(result.tags) && result.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {result.tags.map((tag) => {
                const tagName = typeof tag === 'string' ? tag : tag.name;
                return (
                  <Badge key={tagName} variant="secondary" className="text-xs">
                    <Hash className="h-2 w-2 mr-1" />
                    {highlightText(tagName, searchQuery)}
                  </Badge>
                );
              })}
            </div>
          )}
          
          {/* Status indicators */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            {/* Status badges */}
            <div className="flex gap-2">
              {result.ingestionStatus && (
                <Badge 
                  variant={result.ingestionStatus === 'success' ? 'default' : 
                          result.ingestionStatus === 'failed' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  Ingestion: {result.ingestionStatus}
                </Badge>
              )}
              
              {result.embeddingStatus && (
                <Badge 
                  variant={result.embeddingStatus === 'success' ? 'default' : 
                          result.embeddingStatus === 'failed' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  Embedding: {result.embeddingStatus}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};