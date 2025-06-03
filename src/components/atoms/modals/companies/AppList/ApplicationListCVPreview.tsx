'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Eye } from 'lucide-react';

interface ApplicationListCVPreviewProps {
  cvUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplicationListCVPreview({
  cvUrl,
  isOpen,
  onClose
}: ApplicationListCVPreviewProps) {
  if (!cvUrl) return null;

  const isPdfFile = cvUrl.endsWith('.pdf');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] p-0">
        <DialogHeader className="p-4 border-b bg-gray-50/50">
          <DialogTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            CV Preview
          </DialogTitle>
        </DialogHeader>
        <div className="h-full flex-grow overflow-hidden">
          {isPdfFile ? (
            <iframe 
              src={cvUrl} 
              width="100%" 
              height="100%" 
              title="CV Preview"
              className="border-0"
            />
          ) : (
            <div className="p-8 text-center h-full flex flex-col justify-center">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Cannot preview this file type</p>
              <p className="text-gray-600 mb-6">This file format is not supported for preview.</p>
              <Button asChild className="mx-auto">
                <a href={cvUrl} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-4 h-4 mr-2" />
                  Open CV in new tab
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}