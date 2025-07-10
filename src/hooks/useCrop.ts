import { useState } from 'react';
import { Crop } from 'react-image-crop';
import { getCroppedImg, centerAspectCrop } from '@/lib/utils';
import { PhotoItem } from '@/types/photo';
import { ImageProcessor } from '@/lib/imageProcessors';

export const useCrop = (photos: PhotoItem[], setPhotos: React.Dispatch<React.SetStateAction<PhotoItem[]>>, currentImageProcessor: ImageProcessor) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(null);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [scale, setScale] = useState(1);
  const [processingImage, setProcessingImage] = useState(false);

  const openCropDialog = (index: number) => {
    setCurrentPhotoIndex(index);
    setImgSrc(photos[index].originalSrc);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setScale(1);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (currentPhotoIndex === null) return;
    
    const { width, height } = e.currentTarget;
    const currentPhoto = photos[currentPhotoIndex];
    const aspect = currentPhoto.size.width / currentPhoto.size.height;
    
    setCrop(centerAspectCrop(width, height, aspect));
  };

  const processImageBackground = async (color: string) => {
    if (currentPhotoIndex === null || !completedCrop || !imgSrc) return;
    
    try {
      setProcessingImage(true);
      const croppedImageUrl = await getCroppedImg(imgSrc, completedCrop, scale);
      const result = await currentImageProcessor.process(croppedImageUrl, { color });
      
      setPhotos(prev => prev.map((photo, index) => {
        if (index === currentPhotoIndex) {
          return { 
            ...photo, 
            croppedSrc: result.processedImageSrc, 
            crop: completedCrop 
          };
        }
        return photo;
      }));
      
      setProcessingImage(false);
    } catch (error) {
      console.error('Error processing image background:', error);
      setProcessingImage(false);
    }
  };

  const saveCrop = async () => {
    if (currentPhotoIndex === null || !completedCrop || !imgSrc) return;
    
    try {
      const croppedImageUrl = await getCroppedImg(imgSrc, completedCrop, scale);
      
      setPhotos(prev => {
        const updatedPhotos = prev.map((photo, index) => {
            if (index === currentPhotoIndex) {
                return { ...photo, croppedSrc: croppedImageUrl, crop: completedCrop };
            }
            return photo;
        });

        return updatedPhotos;
      });
      
      setCurrentPhotoIndex(null);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  return {
    currentPhotoIndex,
    setCurrentPhotoIndex,
    imgSrc,
    crop,
    setCrop,
    completedCrop,
    setCompletedCrop,
    scale,
    setScale,
    processingImage,
    openCropDialog,
    onImageLoad,
    processImageBackground,
    saveCrop,
  };
};