import React, { useState } from 'react';
import { Share, Copy, Check, ExternalLink, Loader2, Globe, Link } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { useShare } from '../hooks/useShare';

interface CreateShareModalProps {
  onShareCreated?: () => void;
  trigger?: React.ReactNode;
}

const CreateShareModal: React.FC<CreateShareModalProps> = ({ 
  onShareCreated, 
  trigger 
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [shareData, setShareData] = useState<{shareLink: string, url: string} | null>(null);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  
  const { isLoading, error, createShare, clearError } = useShare();

  const resetForm = () => {
    setName('');
    setShareData(null);
    setCopied(false);
    setCopySuccess(false);
    setFormError('');
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setFormError('Please enter a name for your shared brain');
      return;
    }

    const result = await createShare({ name: name.trim() });
    
    if (result && result.shareLink) {
      setShareData(result);
      // Auto-copy to clipboard when created
      await copyToClipboard(result.url);
      onShareCreated?.();
    } else {
      // If result is null, it means the share was deleted, try creating again
      console.log('Share link was deleted, creating new one...');
      const secondResult = await createShare({ name: name.trim() });
      if (secondResult && secondResult.shareLink) {
        setShareData(secondResult);
        await copyToClipboard(secondResult.url);
        onShareCreated?.();
      }
    }
  };

  const copyToClipboard = async (url?: string) => {
    const textToCopy = url || shareData?.url || '';
    
    if (!textToCopy) return;

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers or non-HTTPS
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
          throw new Error('Fallback copy failed');
        }
      }

      // Show success feedback
      setCopied(true);
      setCopySuccess(true);
      
      // Reset after 2 seconds (shorter for better UX)
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      
      // Keep the success message a bit longer
      setTimeout(() => {
        setCopySuccess(false);
      }, 3000);

      console.log('✅ Successfully copied to clipboard:', textToCopy);

    } catch (err) {
      console.error('❌ Copy failed:', err);
      
      // Show an alert as fallback
      alert(`Copy failed! Please copy manually:\n${textToCopy}`);
    }
  };

  const openInNewTab = () => {
    if (shareData?.url) {
      window.open(shareData.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => resetForm(), 200); // Small delay for smooth closing
  };

  return (
    <div className="bg-background">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" className="gap-2">
              <Share className="h-4 w-4" />
              Share Brain
            </Button>
          )}
        </DialogTrigger>
        
        <DialogContent 
          className="sm:max-w-[500px] min-h-[40vh] max-h-[90vh] overflow-y-auto bg-background border shadow-2xl"
          style={{ 
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))'
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Share Your Knowledge Base
            </DialogTitle>
            <DialogDescription className="mt-5">
              Create a public link to share your entire knowledge base with others.
              Anyone with the link can view all your content.
            </DialogDescription>
          </DialogHeader>

          {!shareData ? (
            // Create Share Form
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Brain Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., My React Learning Resources"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setFormError('');
                    clearError();
                  }}
                  className={formError ? 'border-red-500' : ''}
                  disabled={isLoading}
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && name.trim() && !isLoading) {
                      handleSubmit(e as any);
                    }
                  }}
                />
                {formError && (
                  <p className="text-sm text-red-500">{formError}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  This name will be displayed to people who visit your shared brain.
                </p>
              </div>

              {error && (
                <Alert className="border-destructive/20 bg-destructive/10">
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={(e) => handleSubmit(e as any)} 
                  disabled={isLoading || !name.trim()} 
                  className="gap-2"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? 'Creating...' : 'Create Share Link'}
                </Button>
              </div>
            </div>
          ) : (
            // Share Created Success
            <div className="space-y-4">
              {/* Success Alert with Animation */}
              <Alert className={`border-green-200 bg-green-50 dark:bg-green-950/20 transition-all duration-300 ${
                copySuccess ? 'ring-2 ring-green-300 scale-[1.01]' : ''
              }`}>
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {copySuccess 
                    ? 'Brain shared and link copied to clipboard!' 
                    : 'Your brain has been shared successfully!'
                  }
                </AlertDescription>
              </Alert>

              {/* Share Link Display */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Shareable Link
                </Label>
                
                {/* Generated Link Display */}
                <div className="bg-muted/50 rounded-lg p-3 mb-3 border border-dashed border-muted-foreground/20">
                  <div className="text-xs text-muted-foreground mb-1">Generated Link:</div>
                  <div className="font-mono text-sm text-foreground break-all">
                    {shareData.url}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={shareData.url}
                    readOnly
                    className="flex-1 bg-muted font-mono text-sm"
                  />
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard()}
                    className={`shrink-0 transition-all duration-200 ${
                      copied 
                        ? 'bg-green-100 border-green-300 hover:bg-green-100' 
                        : 'hover:bg-muted'
                    }`}
                    title={copied ? 'Copied!' : 'Copy to clipboard'}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600 animate-pulse" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={openInNewTab}
                    className="shrink-0 hover:bg-blue-50 hover:border-blue-300"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                
                {copied && (
                  <div className="flex items-center gap-2 text-sm text-green-600 animate-pulse bg-green-50 dark:bg-green-950/20 px-3 py-2 rounded-md border border-green-200 dark:border-green-800">
                    <Check className="h-4 w-4" />
                    <span className="font-medium">Link copied to clipboard!</span>
                  </div>
                )}
              </div>

              {/* Share Info */}
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  What's shared?
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• All your successfully processed content</li>
                  <li>• Content titles, links, and tags</li>
                  <li>• Creation dates and content types</li>
                  <li>• Note: Failed or pending content is not included</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center gap-2 pt-2">
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={openInNewTab}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Preview
                  </Button>
                  
                  <Button 
                    onClick={() => copyToClipboard()} 
                    className={`gap-2 transition-all duration-200 ${
                      copied 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : ''
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateShareModal;