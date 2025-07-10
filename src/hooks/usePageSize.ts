import { useState, useEffect } from 'react';
import { PageSize, CustomPageSize } from '@/types/photo';
import { PAGE_SIZES } from '@/constants';

export const usePageSize = () => {
  const [pageSize, setPageSize] = useState<PageSize>(PAGE_SIZES[0]);
  const [customPageSize, setCustomPageSize] = useState<CustomPageSize>({ width: 210, height: 297, defaultMargin: 5 });
  const [customSizes, setCustomSizes] = useState<{name: string; size: CustomPageSize}[]>([]);

  // 加载自定义尺寸配置
  useEffect(() => {
    const savedCustomSizes = localStorage.getItem('customPageSizes');
    if (savedCustomSizes) {
      try {
        const parsedSizes = JSON.parse(savedCustomSizes);
        if (Array.isArray(parsedSizes)) {
          setCustomSizes(parsedSizes);
        }
      } catch (error) {
        console.error('Error loading custom sizes from localStorage:', error);
      }
    }
  }, []);

  const handlePageSizeChange = (value: string) => {
    if (value.startsWith('custom-')) {
      const customSizeIndex = parseInt(value.replace('custom-', ''));
      if (!isNaN(customSizeIndex) && customSizeIndex < customSizes.length) {
        const customSize = customSizes[customSizeIndex].size;
        setCustomPageSize(customSize);
        setPageSize({ ...PAGE_SIZES[0], name: 'custom' });
      }
      return;
    }
    
    if (value === 'custom') {
      return;
    }
    
    const selected = PAGE_SIZES.find(size => size.name === value);
    if (selected) {
      setPageSize(selected);
    }
  };

  const handleCustomSizeChange = (dimension: 'width' | 'height' | 'defaultMargin', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      const newCustomSize = { ...customPageSize, [dimension]: numValue };
      setCustomPageSize(newCustomSize);
    }
  };

  return {
    pageSize,
    setPageSize,
    customPageSize,
    setCustomPageSize,
    customSizes,
    setCustomSizes,
    handlePageSizeChange,
    handleCustomSizeChange,
  };
};