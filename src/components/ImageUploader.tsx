
"use client";

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { ImagePlus, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onFilesChange: (files: (File | string)[]) => void;
  maxFiles?: number;
  existingImages?: string[];
}

export function ImageUploader({ onFilesChange, maxFiles = 4, existingImages = [] }: ImageUploaderProps) {
  const [files, setFiles] = useState<(File | string)[]>([]);

  useEffect(() => {
    setFiles(existingImages);
  }, [existingImages]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
    setFiles(newFiles);
    onFilesChange(newFiles);
  }, [files, onFilesChange, maxFiles]);

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
    maxFiles: maxFiles - files.length,
    multiple: true,
    disabled: files.length >= maxFiles,
  });

  return (
    <div className="space-y-4">
      <div {...getRootProps({ className: cn("flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out", isDragActive ? 'border-primary bg-primary/10' : 'border-input hover:border-primary', files.length >= maxFiles && 'cursor-not-allowed opacity-50') })}>
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
              const isUploaded = !!file;
              
              let url: string | null = null;
              if (file) {
                  url = typeof file === 'string' ? file : URL.createObjectURL(file);
              }

              return (
                <div key={index} className="relative aspect-square group border rounded-md flex items-center justify-center bg-muted/50">
                    {isUploaded && url ? (
                        <>
                            <Image sizes="(max-width: 768px) 50vw, 25vw"
                                src={url}
                                alt={`Preview ${index}`}
                                fill
                                className="object-cover"
                                className="rounded-md"
                                unoptimized={typeof file !== 'string'}
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
                        null
                    )}
                </div>
              )
          })}
        </div>
    </div>
  );
}
