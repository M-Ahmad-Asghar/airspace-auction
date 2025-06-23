"use client";

import { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { UploadCloud, X, File as FileIcon } from 'lucide-react';
import { Button } from './ui/button';

interface ImageUploaderProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
}

export function ImageUploader({ onFilesChange, maxFiles = 5 }: ImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
    setFiles(newFiles);
    onFilesChange(newFiles);

    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
  }, [files, onFilesChange, maxFiles]);

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

  const baseStyle = "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out";
  const activeStyle = "border-primary bg-primary/10";
  const acceptStyle = "border-accent bg-accent/10";
  const rejectStyle = "border-destructive bg-destructive/10";

  const style = useMemo(() => ({
    ...({ ...getRootProps().style }),
    ...(isDragActive ? { ...activeStyle } : {}),
  }), [isDragActive, getRootProps]);

  return (
    <div className="space-y-4">
      <div {...getRootProps({ className: `${baseStyle} ${isDragActive ? activeStyle : 'border-input hover:border-primary'}` })}>
        <input {...getInputProps()} />
        <div className="text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              {isDragActive ? "Drop the files here ..." : "Drag 'n' drop some files here, or click to select files"}
            </p>
            <p className="text-xs text-muted-foreground">Up to {maxFiles} images</p>
        </div>
      </div>

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {previewUrls.map((url, index) => (
            <div key={files[index].name} className="relative aspect-square group">
              <Image
                src={url}
                alt={`Preview ${files[index].name}`}
                layout="fill"
                objectFit="cover"
                className="rounded-md"
                onLoad={() => { URL.revokeObjectURL(url) }}
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
