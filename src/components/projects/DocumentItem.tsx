 
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Trash2 } from 'lucide-react';
import { ProjectDocument } from '@/types/project';
import { formatDistanceToNow } from 'date-fns';

interface DocumentItemProps {
  document: ProjectDocument;
  onViewDocument?: (document: ProjectDocument) => void;
  onRemoveDocument?: (documentId: string) => void;
  onRemove?: (documentId: string) => Promise<void> | void;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ 
  document, 
  onViewDocument, 
  onRemoveDocument,
  onRemove
}) => {
  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'bid':
        return document.content.approved 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'plan':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'pricing':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getDocumentTypeText = (type: string) => {
    if (type === 'bid' && document.content.approved) {
      return 'Approved Bid';
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const dateText = document.createdAt instanceof Date 
    ? formatDistanceToNow(document.createdAt, { addSuffix: true })
    : formatDistanceToNow(new Date(document.createdAt), { addSuffix: true });

  const handleRemove = () => {
    if (onRemove) {
      onRemove(document.id);
    } else if (onRemoveDocument) {
      onRemoveDocument(document.id);
    }
  };

  return (
    <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
            <FileText className="h-6 w-6 text-bidgenius-600" />
          </div>
          <div>
            <div className="font-medium">{document.name}</div>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className={getDocumentTypeColor(document.type)}>
                {getDocumentTypeText(document.type)}
              </Badge>
              <span className="text-xs text-gray-500 dark:text-gray-400">{dateText}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onViewDocument && onViewDocument(document)}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
            onClick={handleRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DocumentItem;
