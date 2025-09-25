import { useState } from 'react';
import { Search, LogOut, User, RefreshCw, Share, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useContent } from '../hooks/useContent';
import { useContentPolling } from '../hooks/useContentPolling';
import CreateContentModal from '@/components/CreateContentModal';
import { useNavigate } from 'react-router-dom';
import CreateShareModal from '@/components/CreateShareModal';
import { Content } from '../types/content';
import { ContentCard } from '@/components/ContentCard';

const Dashboard = () => {
  const navigate = useNavigate(); 
  const { logout, user } = useAuth();
  const { 
    contents, 
    isLoading, 
    error, 
    refetch, 
    deleteContent, 
    retryEmbedding,
    updateContentDescription 
  } = useContent();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [editingDescription, setEditingDescription] = useState<string>('');
  const [showDescriptionModal, setShowDescriptionModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  // Polling for pending items
  const { hasPendingItems } = useContentPolling({
    contents,
    onRefetch: refetch,
    interval: 5000,
  });
  
  // Filter contents based on search and tab
  const filteredContents = contents.filter((content: Content) => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.textContent?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (Array.isArray(content.tags) && 
                          content.tags.some(tag => {
                            const tagName = typeof tag === 'string' ? tag : tag.name;
                            return tagName.toLowerCase().includes(searchQuery.toLowerCase());
                          }));

    if (selectedTab === 'all') return matchesSearch;
    if (selectedTab === 'youtube') return matchesSearch && content.type === 'youtube';
    if (selectedTab === 'twitter') return matchesSearch && content.type === 'tweet';
    if (selectedTab === 'notes') return matchesSearch && content.type === 'note';
    if (selectedTab === 'pending') {
      return matchesSearch && (
        content.ingestionStatus === 'pending' || 
        content.embeddingStatus === 'pending'
      );
    }
    if (selectedTab === 'failed') {
      return matchesSearch && (
        content.ingestionStatus === 'failed' || 
        content.embeddingStatus === 'failed'
      );
    }
    return matchesSearch;
  });

  const handleDelete = async (id: string) => {
    const result = await deleteContent(id);
    if (!result.success && result.error) {
      console.error('Delete failed:', result.error);
    }
  };

  const handleRetryEmbedding = async (id: string) => {
    const result = await retryEmbedding(id);
    if (!result.success && result.error) {
      console.error('Retry failed:', result.error);
    }
  };

  const handleViewDescription = (content: Content) => {
    setSelectedContent(content);
    setEditingDescription(content.textContent || '');
    setShowDescriptionModal(true);
  };

  const handleUpdateDescription = async () => {
    if (selectedContent && updateContentDescription) {
      const result = await updateContentDescription(selectedContent._id, editingDescription);
      if (result.success) {
        setShowDescriptionModal(false);
        refetch();
      } else {
        console.error('Update failed:', result.error);
      }
    }
  };

  const getTabCounts = () => {
    const counts = {
      all: contents.length,
      youtube: contents.filter((c: Content) => c.type === 'youtube').length,
      twitter: contents.filter((c: Content) => c.type === 'tweet').length,
      notes: contents.filter((c: Content) => c.type === 'note').length,
      pending: contents.filter((c: Content) => 
        c.ingestionStatus === 'pending' || c.embeddingStatus === 'pending'
      ).length,
      failed: contents.filter((c: Content) => 
        c.ingestionStatus === 'failed' || c.embeddingStatus === 'failed'
      ).length,
    };
    return counts;
  };

  const tabCounts = getTabCounts();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading your content...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-40 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {/* Top row - Title and Actions */}
            <div className="flex items-center justify-between">
              <h1 
                className="text-2xl font-bold hover:cursor-pointer " 
                onClick={() => navigate("/")}
              >
                SHAREPORT
              </h1>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={refetch}
                  className={`hover:cursor-pointer ${hasPendingItems ? 'animate-pulse' : ''}`}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>

                <CreateContentModal onContentCreated={refetch} />

                <CreateShareModal 
                  onShareCreated={refetch}
                  trigger={
                    <Button variant="outline" size="icon" className='hover:cursor-pointer'>
                      <Share className="h-4 w-4" />
                    </Button>
                  }
                />

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate('/bin')}
                  className="hover:cursor-pointer"
                  title="View Bin"
                >
                  <Trash2 className="h-4 w-4" />
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
                        <h3 className="font-semibold text-lg">{user?.username || user?.username || 'User'}</h3>
                        <p className="text-muted-foreground">{user?.email || 'user@example.com'}</p>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="font-semibold">{contents.length}</div>
                            <div className="text-sm text-muted-foreground">Total Content</div>
                          </div>
                          <div>
                            <div className="font-semibold">
                              {contents.filter((c: Content) => c.embeddingStatus === 'success').length}
                            </div>
                            <div className="text-sm text-muted-foreground">Processed</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="ghost" size="icon" onClick={logout} className='hover:cursor-pointer'>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Actions */}
              <div className="md:hidden flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={refetch}
                  className={`hover:cursor-pointer ${hasPendingItems ? 'animate-pulse' : ''}`}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate('/bin')}
                  className="hover:cursor-pointer"
                  title="View Bin"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

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
                        <h3 className="font-semibold text-lg">{user?.username || user?.username || 'User'}</h3>
                        <p className="text-muted-foreground">{user?.email || 'user@example.com'}</p>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="font-semibold">{contents.length}</div>
                            <div className="text-sm text-muted-foreground">Total Content</div>
                          </div>
                          <div>
                            <div className="font-semibold">
                              {contents.filter((c: Content) => c.embeddingStatus === 'success').length}
                            </div>
                            <div className="text-sm text-muted-foreground">Processed</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="ghost" size="icon" onClick={logout} className='hover:cursor-pointer'>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Second row - Search and Mobile Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md cursor-pointer" onClick={() => navigate('/search')}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  className="pl-9 cursor-pointer"
                  readOnly
                />
              </div>

              {/* Mobile Action Buttons */}
              <div className="md:hidden flex gap-2">
                <CreateContentModal onContentCreated={refetch} />
                
                <CreateShareModal 
                  onShareCreated={refetch}
                  trigger={
                    <Button variant="outline" size="sm" className='hover:cursor-pointer'>
                      <Share className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  }
                />

                <ThemeToggle />
              </div>
            </div>
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
                onClick={refetch}
                className="ml-3 hover:cursor-pointer"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs for filtering */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          {/* Responsive Tabs */}
          <div className="mb-6">
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="grid grid-cols-6 w-full min-w-[600px] h-auto p-1">
                <TabsTrigger 
                  value="all" 
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm hover:cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span>All</span>
                  {tabCounts.all > 0 && (
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full min-w-[1.5rem] text-center">
                      {tabCounts.all}
                    </span>
                  )}
                </TabsTrigger>
                
                <TabsTrigger 
                  value="youtube" 
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm hover:cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span>YouTube</span>
                  {tabCounts.youtube > 0 && (
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full min-w-[1.5rem] text-center">
                      {tabCounts.youtube}
                    </span>
                  )}
                </TabsTrigger>
                
                <TabsTrigger 
                  value="twitter" 
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm hover:cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span>Twitter</span>
                  {tabCounts.twitter > 0 && (
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full min-w-[1.5rem] text-center">
                      {tabCounts.twitter}
                    </span>
                  )}
                </TabsTrigger>
                
                <TabsTrigger 
                  value="notes" 
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm hover:cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span>Notes</span>
                  {tabCounts.notes > 0 && (
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full min-w-[1.5rem] text-center">
                      {tabCounts.notes}
                    </span>
                  )}
                </TabsTrigger>
                
                <TabsTrigger 
                  value="pending" 
                  className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm hover:cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground ${hasPendingItems ? 'text-yellow-600' : ''}`}
                >
                  <span>Pending</span>
                  {tabCounts.pending > 0 && (
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded-full min-w-[1.5rem] text-center">
                      {tabCounts.pending}
                    </span>
                  )}
                </TabsTrigger>
                
                <TabsTrigger 
                  value="failed" 
                  className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm hover:cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground ${tabCounts.failed > 0 ? 'text-red-600' : ''}`}
                >
                  <span>Failed</span>
                  {tabCounts.failed > 0 && (
                    <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-1.5 py-0.5 rounded-full min-w-[1.5rem] text-center">
                      {tabCounts.failed}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value={selectedTab} className="mt-0">
            {filteredContents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  {searchQuery ? (
                    <>
                      No content found matching "<strong>{searchQuery}</strong>"
                    </>
                  ) : selectedTab === 'all' ? (
                    'No content yet. Add your first piece of content!'
                  ) : (
                    `No ${selectedTab} content found.`
                  )}
                </div>
                {!searchQuery && selectedTab === 'all' && (
                  <div className="mt-4">
                    <CreateContentModal onContentCreated={refetch} />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full">
                {/* Responsive grid with proper spacing and centering */}
                <div className="grid grid-cols-1 gap-6 sm:gap-8 place-items-center sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
                  {filteredContents.map((content) => (
                    <div key={content._id} className="w-full max-w-[400px] flex justify-center overflow-x-auto">
                      <ContentCard 
                        content={content} 
                        onDelete={handleDelete} 
                        onRetryEmbedding={handleRetryEmbedding} 
                        onEdit={handleViewDescription}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Description Modal */}
      <Dialog open={showDescriptionModal} onOpenChange={setShowDescriptionModal}>
        <DialogContent 
          className="max-w-2xl max-h-[80vh] overflow-y-auto flex flex-col mx-4"
          style={{ 
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))'
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Description
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto flex flex-col gap-4">
            <div>
              <h4 className="font-medium mb-2">{selectedContent?.title}</h4>
              <p className="text-sm text-muted-foreground text-blue-400 break-all">
                {selectedContent?.link || selectedContent?.link}
              </p>
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-sm font-medium mb-2">Description:</label>
              <label className="text-sm font-small mb-2 text-yellow-300">
                Please enter relatable content so that it can be found easily during search
              </label>
              <Textarea
                value={editingDescription}
                onChange={(e) => setEditingDescription(e.target.value)}
                placeholder="Enter content description..."
                className="flex-1 min-h-[200px] resize-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
              <Button
                className='hover:cursor-pointer w-full sm:w-auto'
                variant="outline"
                onClick={() => setShowDescriptionModal(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="outline" 
                onClick={handleUpdateDescription} 
                className='hover:cursor-pointer w-full sm:w-auto'
              >
                Update Description
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;