// components/CreateContentModal.tsx
import React, { useState } from 'react';
import { Plus, Youtube, Twitter, FileText, X, Loader2 } from 'lucide-react';
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
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

import { Badge } from './ui/badge';
import { contentService } from '../services/contentService';
import { CreateContentRequest, ContentType } from '../types';
import { handleApiError } from '../utils/errorHandler';

interface CreateContentModalProps {
  onContentCreated: () => void; // Callback to refresh content list
}

const CreateContentModal: React.FC<CreateContentModalProps> = ({ onContentCreated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<ContentType>('youtube');
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    textContent: '',
    tags: [] as string[],
    tagInput: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const contentTypes = [
    { value: 'youtube' as ContentType, label: 'YouTube Video', icon: Youtube, color: 'bg-red-500' },
    { value: 'twitter' as ContentType, label: 'Twitter Thread', icon: Twitter, color: 'bg-blue-500' },
    { value: 'note' as ContentType, label: 'Personal Note', icon: FileText, color: 'bg-green-500' },
  ];

  const resetForm = () => {
    setFormData({
      title: '',
      link: '',
      textContent: '',
      tags: [],
      tagInput: ''
    });
    setErrors({});
    setSelectedType('youtube');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (selectedType !== 'note' && !formData.link.trim()) {
      newErrors.link = 'Link is required for YouTube and Twitter content';
    }

    if (selectedType === 'note' && !formData.textContent.trim()) {
      newErrors.textContent = 'Content is required for notes';
    }

    // Validate URLs
    if (selectedType === 'youtube' && formData.link) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/;
      if (!youtubeRegex.test(formData.link)) {
        newErrors.link = 'Please provide a valid YouTube URL';
      }
    }

    if (selectedType === 'tweet' && formData.link) {
      const twitterRegex = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/;
      if (!twitterRegex.test(formData.link)) {
        newErrors.link = 'Please provide a valid Twitter/X URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = () => {
    const tag = formData.tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: ''
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const requestData: CreateContentRequest = {
        title: formData.title.trim(),
        type: selectedType,
        tags: formData.tags,
        ...(selectedType !== 'note' && { link: formData.link.trim() }),
        ...(selectedType === 'note' && { textContent: formData.textContent.trim() })
      };

      await contentService.createContent(requestData);
      
      // Success - close modal and refresh content
      setOpen(false);
      resetForm();
      onContentCreated();
      
      // You could add a success toast here
    } catch (error) {
      const errorMsg = handleApiError(error);
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Content
        </Button>
      </DialogTrigger>
      
      <DialogContent 
        className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-background border shadow-2xl"
        style={{ 
          backgroundColor: 'hsl(var(--background))',
          borderColor: 'hsl(var(--border))'
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Content
          </DialogTitle>
          <DialogDescription>
            Add YouTube videos, Twitter threads, or personal notes to your knowledge base.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Type Selection */}
          <div className="space-y-3">
            <Label>Content Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {contentTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.value;
                
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedType(type.value)}
                    className={`
                      flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
                      ${isSelected 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter a descriptive title..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* URL Field (for YouTube & Twitter) */}
          {selectedType !== 'note' && (
            <div className="space-y-2">
              <Label htmlFor="link">
                {selectedType === 'youtube' ? 'YouTube URL' : 'Twitter URL'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="link"
                type="url"
                placeholder={
                  selectedType === 'youtube' 
                    ? 'https://youtube.com/watch?v=...' 
                    : 'https://twitter.com/user/status/...'
                }
                value={formData.link}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                className={errors.link ? 'border-red-500' : ''}
              />
              {errors.link && <p className="text-sm text-red-500">{errors.link}</p>}
            </div>
          )}

          {/* Text Content (for Notes) */}
          {selectedType === 'note' && (
            <div className="space-y-2">
              <Label htmlFor="textContent">
                Note Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="textContent"
                placeholder="Write your note here..."
                rows={6}
                value={formData.textContent}
                onChange={(e) => setFormData(prev => ({ ...prev, textContent: e.target.value }))}
                className={errors.textContent ? 'border-red-500' : ''}
              />
              {errors.textContent && <p className="text-sm text-red-500">{errors.textContent}</p>}
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add tags..."
                value={formData.tagInput}
                onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded">
              {errors.submit}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Creating...' : 'Create Content'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateContentModal;