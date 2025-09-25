import { useEffect, useState } from 'react';
import { Trash2, RefreshCw, Undo2, X, AlertTriangle, Search, ArrowLeft, Clock, LogOut, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useContent } from '../hooks/useContent';
import { useNavigate } from 'react-router-dom';
import { Content } from '@/types';

const Bin = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const {
    binContents,
    fetchBinContents,
    undoDelete,
    hardDeleteContent,
    isLoading,
    error,
  } = useContent();

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
  const [contentToDelete, setContentToDelete] = useState<any>(null);

  useEffect(() => {
    fetchBinContents();
  }, [fetchBinContents]);

  const handleUndoDelete = async (id: string) => {
    setActionLoading(id);
    try {
      const result = await undoDelete(id);
      if (!result.success) console.error(result.error);
      else fetchBinContents();
    } finally {
      setActionLoading(null);
    }
  };

  const handleHardDelete = async (id: string) => {
    setActionLoading(id);
    try {
      const result = await hardDeleteContent(id);
      if (!result.success) console.error(result.error);
      else fetchBinContents();
    } finally {
      setActionLoading(null);
      setShowDeleteConfirmModal(false);
      setContentToDelete(null);
    }
  };

  const getTimeUntilExpiry = (deletedAt: string) => {
    const deleted = new Date(deletedAt);
    const expiry = new Date(deleted.getTime() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return { text: 'Expired', isExpired: true };

    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

    return { 
      text: days > 0 ? `${days} days left` : `${hours} hours left`,
      isExpired: false
    };
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube': return '📺';
      case 'tweet': return '🐦';
      case 'note': return '📝';
      default: return '📄';
    }
  };

  const filteredBinContents = binContents.filter((content: Content) => {
    return content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           content.textContent?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading bin contents...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-40 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Trash2 className="h-6 w-6" />
                Bin
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={fetchBinContents}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              <ThemeToggle />

              <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg">{user?.username || 'User'}</h3>
                      <p className="text-muted-foreground">{user?.email || 'user@example.com'}</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search and Info */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bin content..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Deleted content is kept for 30 days
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {error && (
          <Alert className="mb-6 border-destructive/20 bg-destructive/10">
            <AlertDescription className="text-destructive">
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchBinContents}
                className="ml-3"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {filteredBinContents.length === 0 ? (
          <div className="text-center py-12">
            {searchQuery ? (
              <>
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  No content found matching "<strong>{searchQuery}</strong>"
                </p>
              </>
            ) : (
              <>
                <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Bin is empty</h3>
                <p className="text-muted-foreground">
                  Deleted content will appear here and be purged after 30 days
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="w-full">
            {/* Stats Bar */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="font-semibold text-lg">{filteredBinContents.length}</div>
                    <div className="text-sm text-muted-foreground">Items in Bin</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg text-green-600">
                      {filteredBinContents.filter((c: Content) => !getTimeUntilExpiry(c.deletedAt || '').isExpired).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Recoverable</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg text-red-600">
                      {filteredBinContents.filter((c: Content) => getTimeUntilExpiry(c.deletedAt || '').isExpired).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Expired</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBinContents.map((content) => {
                const expiryInfo = getTimeUntilExpiry(content.deletedAt || '');
                
                return (
                  <div key={content._id} className="bg-card rounded-lg border p-6 hover:shadow-lg transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-lg">{getTypeIcon(content.type)}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-lg line-clamp-2 mb-1">{content.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {content.type}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Link */}
                    {content.link && (
                      <div className="mb-4">
                        <a
                          href={content.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                        >
                          {content.link.length > 50 ? `${content.link.substring(0, 50)}...` : content.link}
                        </a>
                      </div>
                    )}

                    {/* Expiry Info */}
                    {content.deletedAt && (
                      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs text-muted-foreground">
                            Deleted: {new Date(content.deletedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className={`text-sm font-medium ${expiryInfo.isExpired ? 'text-red-600' : 'text-yellow-600'}`}>
                          {expiryInfo.text}
                        </div>
                      </div>
                    )}

                    {/* Content Preview */}
                    {content.textContent && (
                      <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {content.textContent}
                        </p>
                      </div>
                    )}

                    {/* Actions - Only Restore and Delete */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUndoDelete(content._id)}
                        disabled={actionLoading === content._id || expiryInfo.isExpired}
                        className="flex-1 hover:cursor-pointer "
                      >
                        {actionLoading === content._id ? (
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Undo2 className="h-3 w-3 mr-1" />
                        )}
                        Restore
                      </Button>

                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          setContentToDelete(content);
                          setShowDeleteConfirmModal(true);
                        }}
                        className='hover:cursor-pointer'
                      >
                        <X className="h-3 w-3 mr-1 " />
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirmModal} onOpenChange={setShowDeleteConfirmModal}>
        <DialogContent className="max-w-md" style={{ 
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))'
          }} >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Permanently Delete
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. Delete <strong>{contentToDelete?.title}</strong> permanently?
          </p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteConfirmModal(false);
                setContentToDelete(null);
              }}
              className='hover:cursor-pointer'
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => contentToDelete && handleHardDelete(contentToDelete._id)}
              disabled={actionLoading === contentToDelete?._id}
              className='hover:cursor-pointer'
            >
              {actionLoading === contentToDelete?._id ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Bin;