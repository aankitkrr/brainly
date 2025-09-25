import React, { useState } from 'react';
import { 
  Youtube, 
  Twitter, 
  FileText, 
  MoreVertical, 
  RefreshCw, 
  Trash2, 
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Edit3
} from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Content, ContentType } from '../types';

interface ContentCardProps {
  content: Content;
  onDelete: (id: string) => void;
  onRetryEmbedding: (id: string) => void;
  onEdit?: (content: Content) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onDelete,
  onRetryEmbedding,
  onEdit,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'youtube':
        return <Youtube className="h-5 w-5 text-red-600" />;
      case 'tweet':
        return <Twitter className="h-5 w-5 text-blue-500" />;
      case 'note':
        return <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Extract tweet ID from Twitter URL
  const getTweetId = (url: string): string | null => {
    if (!url) return null;
    const regex = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getStatusBadge = (status: string | undefined, error?: string) => {
    if (!status) return null;

    switch (status) {
      case 'success':
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-700 ">
            <CheckCircle className="h-3 w-3  " />
            Success
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="flex items-center gap-1 bg-red-700 " title={error}>
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="default" className="flex items-center bg-orange-600 gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleRetryEmbedding = async () => {
    setIsRetrying(true);
    try {
      await onRetryEmbedding(content._id);
    } finally {
      setIsRetrying(false);
    }
  };

  const renderContent = (content: Content) => {
    if (content.type === 'youtube') {
      const videoId = getYouTubeVideoId(content.link || content.link || '');
      if (videoId) {
        return (
          <div className="relative w-full aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-80 h-60 rounded-lg"
            />
          </div>
        );
      }
    } else if (content.type === 'tweet') {
      const tweetId = getTweetId(content.link || content.link || '');
      if (tweetId) {
        return (
          <div className="w-80 h-60 overflow-y-auto scroll-auto " key={`tweet-${content._id}` }>
            <blockquote 
              className="twitter-tweet" 
              data-theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
            >
              <a href={ `https://twitter.com/i/status/${tweetId}` }>Loading tweet...</a>
            </blockquote>
            <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
          </div>
        );
      }
    } else if (content.type === 'note') {
      return (
        <div className="p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {content.textContent || 'No content'}
          </p>
        </div>
      );
    }
    
    return (
      <div className="p-4 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Content preview not available
        </p>
      </div>
    );
  };


  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canRetryEmbedding = content.embeddingStatus === 'failed';
  const showRetryButton = canRetryEmbedding;

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getTypeIcon(content.type)}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight truncate">
                {content.title}
              </h3>
              {content.link && (
                <a
                  href={content.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Source
                </a>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild >
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:cursor-pointer">
                <MoreVertical className="h-4 w-4 " />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" style={{ 
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))'
                }} >
              {onEdit && (
                <>
                  <DropdownMenuItem className=' hover:cursor-pointer' onClick={() => onEdit(content)  }>
                    <Edit3 className="h-4 w-4 mr-2  hover:cursor-pointer " />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete(content._id)}
                className="text-destructive focus:text-destructive  hover:cursor-pointer "
              >
                <Trash2 className="h-4 w-4 mr-2 " />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 w-full ">
          {renderContent(content)}
        {/* Status Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Ingestion Status
            </span>
            {getStatusBadge(content.ingestionStatus, content.ingestionError!)}
          </div>

          {content.embeddingStatus && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Embedding Status
              </span>
              <div className="flex items-center gap-2">
                {getStatusBadge(content.embeddingStatus, content.embeddingError!)}
                {showRetryButton && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRetryEmbedding}
                    disabled={isRetrying}
                    className="h-6 px-2 text-xs hover:cursor-pointer"
                  >
                    {isRetrying ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {content.tags && Array.isArray(content.tags) && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {content.tags.slice(0, 3).map((tag, index) => {
              const tagName = typeof tag === 'string' ? tag : tag.name;
              return (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tagName}
                </Badge>
              );
            })}
            {content.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{content.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Created {formatDate(content.createdAt)}</span>
          {content.ingestionAttempts! > 1 && (
            <span className="text-yellow-600 dark:text-yellow-400">
              {content.ingestionAttempts} attempts
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};