import { useState } from 'react';
import { PhotoItem } from '@/types/photo';
import { ID_PHOTO_SIZES } from '@/constants';

export const usePhotos = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos: PhotoItem[] = [];
      
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            const newPhoto: PhotoItem = {
              id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              originalSrc: reader.result,
              size: ID_PHOTO_SIZES[0], // 默认选择1寸
              repeatCount: 1 // 默认重复次数为1
            };
            
            newPhotos.push(newPhoto);
            
            if (newPhotos.length === Array.from(e.target.files!).length) {
                setPhotos(prev => [...prev, ...newPhotos]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handlePhotoSizeChange = (photoId: string, sizeName: string) => {
    const newSize = ID_PHOTO_SIZES.find(size => size.name === sizeName);
    if (!newSize) return;
    
    setPhotos(prev => prev.map(photo => {
        if (photo.id === photoId) {
            return { ...photo, size: newSize, crop: undefined, croppedSrc: undefined };
        }
        return photo;
    }));
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
  };

  const duplicatePhoto = (id: string) => {
    const photoToDuplicate = photos.find(photo => photo.id === id);
    if (!photoToDuplicate) return;
    
    const newPhoto: PhotoItem = {
      ...photoToDuplicate,
      id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    
    setPhotos(prev => [...prev, newPhoto]);
  };

  return {
    photos,
    setPhotos,
    handlePhotoUpload,
    handlePhotoSizeChange,
    removePhoto,
    duplicatePhoto,
  };
};