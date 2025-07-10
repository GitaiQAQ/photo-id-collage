import { useState } from 'react';
import { LayoutResult, LayoutAdapter, layoutAdapters, getDefaultLayoutAdapter } from '@/lib/layoutAdapters';
import { PhotoItem } from '@/types/photo';
import { mmToPixels } from '@/lib/utils';

export const useLayout = () => {
  const [layout, setLayout] = useState<LayoutResult>({ positions: [], totalPhotos: 0 });
  const [currentLayoutAdapter, setCurrentLayoutAdapter] = useState<LayoutAdapter>(getDefaultLayoutAdapter());

  const updateLayout = (pageWidth: number, pageHeight: number, currentPhotos: PhotoItem[], margin: any) => {
    if (currentPhotos.length === 0) {
        setLayout({ positions: [], totalPhotos: 0 });
        return;
    }
    
    const result = currentLayoutAdapter.calculateLayout(
      pageWidth,
      pageHeight,
      currentPhotos,
      margin,
      mmToPixels
    );
    
    setLayout(result);
  };

  const handleLayoutAdapterChange = (adapterName: string) => {
    const adapter = layoutAdapters.find(a => a.name === adapterName);
    if (adapter) {
      setCurrentLayoutAdapter(adapter);
      // Re-layout is handled by the component that uses this hook
    }
  };

  return {
    layout,
    updateLayout,
    currentLayoutAdapter,
    handleLayoutAdapterChange,
  };
};