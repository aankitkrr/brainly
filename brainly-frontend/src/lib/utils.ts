import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}




                  // <div key={content._id} className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
                  //   {/* Content Preview */}
                  //   <div className="p-4">
                  //     {renderContent(content)}
                  //   </div>
                    
                  //   {/* Content Info */}
                  //   <div className="p-4 border-t">
                  //     <div className="flex items-start justify-between gap-2 mb-2">
                  //       <h3 className="font-medium text-sm line-clamp-2 flex-1">
                  //         {content.title}
                  //       </h3>
                  //       <div className="flex items-center gap-1 flex-shrink-0">
                  //         <Button
                  //           variant="ghost"
                  //           size="icon"
                  //           className="h-8 w-8"
                  //           onClick={() => handleViewDescription(content)}
                  //         >
                  //           <Eye className="h-3 w-3" />
                  //         </Button>
                  //         <Button
                  //           variant="ghost"
                  //           size="icon"
                  //           className="h-8 w-8 text-destructive hover:text-destructive"
                  //           onClick={() => handleDelete(content._id)}
                  //         >
                  //           <X className="h-3 w-3" />
                  //         </Button>
                  //       </div>
                  //     </div>
                      
                  //     {/* Tags */}
                  //     {content.tags && content.tags.length > 0 && (
                  //       <div className="flex flex-wrap gap-1 mb-3">
                  //         {content.tags.slice(0, 3).map((tag, index) => (
                  //           <Badge 
                  //             key={typeof tag === 'string' ? tag : tag.id || index} 
                  //             variant="secondary" 
                  //             className="text-xs px-2 py-0.5"
                  //           >
                  //             <Tag className="h-2 w-2 mr-1" />
                  //             {typeof tag === 'string' ? tag : tag.name}
                  //           </Badge>
                  //         ))}
                  //         {content.tags.length > 3 && (
                  //           <Badge variant="outline" className="text-xs px-2 py-0.5">
                  //             +{content.tags.length - 3} more
                  //           </Badge>
                  //         )}
                  //       </div>
                  //     )}
                      
                  //     {/* Status indicators */}
                  //     <div className="flex items-center justify-between text-xs">
                  //       <div className="flex items-center gap-2">
                  //         {content.embeddingStatus === 'pending' && (
                  //           <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                  //             Processing
                  //           </span>
                  //         )}
                  //         {content.embeddingStatus === 'failed' && (
                  //           <button
                  //             onClick={() => handleRetryEmbedding(content._id)}
                  //             className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                  //           >
                  //             Retry
                  //           </button>
                  //         )}
                  //         {content.embeddingStatus === 'success' && (
                  //           <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                  //             Ready
                  //           </span>
                  //         )}
                  //       </div>
                  //       <span className="text-muted-foreground capitalize">
                  //         {content.type}
                  //       </span>
                  //     </div>
                  //   </div>
                  // </div>