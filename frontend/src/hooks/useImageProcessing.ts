import { useState, useCallback } from 'react';

interface ImageProcessingState {
  selectedImage: File | null;
  imagePreview: string | null;
  isUploading: boolean;
}

interface ImageProcessingActions {
  handleImageSelect: (file: File) => void;
  handleImageRemove: () => void;
  setUploading: (uploading: boolean) => void;
  reset: () => void;
}

export const useImageProcessing = (): ImageProcessingState & ImageProcessingActions => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageSelect = useCallback((file: File) => {
    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleImageRemove = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
  }, []);

  const setUploading = useCallback((uploading: boolean) => {
    setIsUploading(uploading);
  }, []);

  const reset = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    setIsUploading(false);
  }, []);

  return {
    selectedImage,
    imagePreview,
    isUploading,
    handleImageSelect,
    handleImageRemove,
    setUploading,
    reset
  };
};
