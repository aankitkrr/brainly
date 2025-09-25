import React, { useEffect, useState } from 'react';
import { Search, Youtube, ExternalLink, Hash, Calendar, AlertCircle } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useSharedContent } from '../hooks/useShare';

const formatDistanceToNow = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
};

const PublicSharePage: React.FC = () => {
  const shareLink = window.location.pathname.split('/').pop() || '';
  const { content, isLoading, error, refetch } = useSharedContent(shareLink);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (shareLink) {
      refetch();
    }
  }, [shareLink, refetch]);

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some((tag : any) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube':
        return <Youtube className="h-4 w-4 text-red-500" />;
      case 'twitter':
        return (
          <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
      case 'note':
        return <Hash className="h-4 w-4 text-green-500" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getStatusColor = (embeddingStatus: string, ingestionStatus: string) => {
    if (embeddingStatus === 'success' && ingestionStatus === 'success') {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (embeddingStatus === 'pending' || ingestionStatus === 'pending') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    return 'bg-red-100 text-red-800 border-red-200';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Share Not Found</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.href = '/'}>
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Shared Knowledge Base
              </h1>
              <p className="text-sm text-muted-foreground">
                Public collection • {content.length} items
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
            >
              Create Your Own
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Content Grid */}
            {filteredContent.length === 0 ? (
              <div className="text-center py-12">
                <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchQuery ? 'No matching content' : 'No content shared yet'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search terms' : 'This knowledge base is empty'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredContent.map((item) => (
                  <Card key={item._id} className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <span className="text-xs font-medium text-muted-foreground uppercase">
                            {item.type}
                          </span>
                        </div>
                        
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(item.embeddingStatus, item.ingestionStatus)}`}
                        >
                          {item.embeddingStatus === 'success' && item.ingestionStatus === 'success' 
                            ? 'Ready' 
                            : 'Processing'
                          }
                        </Badge>
                      </div>

                      <h3 className="font-medium text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>

                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.tags.slice(0, 3).map((tag : any) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{item.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(item.createdAt))}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 text-xs"
                          onClick={() => window.open(item.link, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PublicSharePage;