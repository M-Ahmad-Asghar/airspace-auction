
"use client";

import { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { ImagePlus, X, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
}

const FilePlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M14.5 4L20 9.5V17C20 18.1046 19.1046 19 18 19H6C4.89543 19 4 18.1046 4 17V7C4 5.89543 4.89543 5 6 5H13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 4.5V9C14 9.27614 14.2239 9.5 14.5 9.5H19" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 12V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M7 15H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
)


export function ImageUploader({ onFilesChange, maxFiles = 4 }: ImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
    setFiles(newFiles);

    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    // Clean up old object URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls(newPreviewUrls);
    onFilesChange(newFiles);
  }, [files, onFilesChange, maxFiles, previewUrls]);

  const removeFile = (index: number) => {
    const newFiles = [...files];
    const newPreviewUrls = [...previewUrls];
    
    newFiles.splice(index, 1);
    const removedUrl = newPreviewUrls.splice(index, 1)[0];
    URL.revokeObjectURL(removedUrl);
    
    setFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
    onFilesChange(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
    maxFiles,
    multiple: true,
  });

  return (
    <div className="space-y-4">
      <div {...getRootProps({ className: cn("flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out", isDragActive ? 'border-primary bg-primary/10' : 'border-input hover:border-primary') })}>
        <input {...getInputProps()} />
        <div className="text-center">
            <ImagePlus className="mx-auto h-12 w-12 text-muted-foreground" strokeWidth={1} />
            <p className="mt-4 text-lg font-semibold text-foreground">
              Add Photos
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
                or drag and drop
            </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: maxFiles }).map((_, index) => {
              const file = files[index];
              const url = previewUrls[index];
              const isUploaded = !!file;

              return (
                <div key={index} className="relative aspect-square group border rounded-md flex items-center justify-center bg-muted/50">
                    {isUploaded ? (
                        <>
                            <Image
                                src={url}
                                alt={`Preview ${file.name}`}
                                layout="fill"
                                objectFit="cover"
                                className="rounded-md"
                            />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        index === maxFiles-1 ? <Lock className="h-8 w-8 text-muted-foreground/50"/> : null
                    )}
                </div>
              )
          })}
        </div>
    </div>
  );
}

