import { useCallback } from 'react';
import { toPng } from 'html-to-image';
import { mmToPixels } from '@/lib/utils';
import { LayoutResult } from '@/lib/layoutAdapters';
import { PhotoItem } from '@/types/photo';
import { PageSize, CustomPageSize } from '@/types/photo';

export const useSaveImage = (pageRef: React.RefObject<HTMLDivElement>, pageSize: PageSize, customPageSize: CustomPageSize, layout: LayoutResult, photos: PhotoItem[]) => {
  const saveImage = useCallback(async () => {
    if (!pageRef.current) return;

    try {
      alert("正在生成图片，请稍候...");

      const pageWidthPx = mmToPixels(pageSize.name === 'custom' ? customPageSize.width : pageSize.width);
      const pageHeightPx = mmToPixels(pageSize.name === 'custom' ? customPageSize.height : pageSize.height);

      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = `${pageWidthPx}px`;
      tempContainer.style.height = `${pageHeightPx}px`;
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.overflow = 'hidden';
      document.body.appendChild(tempContainer);

      const exportDiv = document.createElement('div');
      exportDiv.style.width = `${pageWidthPx}px`;
      exportDiv.style.height = `${pageHeightPx}px`;
      exportDiv.style.position = 'relative';
      exportDiv.style.backgroundColor = 'white';
      exportDiv.style.overflow = 'hidden';
      tempContainer.appendChild(exportDiv);

      for (const pos of layout.positions) {
        const photo = photos.find(p => p.id === pos.photoId);
        if (!photo || !photo.croppedSrc) continue;

        const photoDiv = document.createElement('div');
        photoDiv.style.position = 'absolute';
        photoDiv.style.left = `${pos.left}px`;
        photoDiv.style.top = `${pos.top}px`;
        photoDiv.style.width = `${pos.width}px`;
        photoDiv.style.height = `${pos.height}px`;
        photoDiv.style.overflow = 'hidden';

        const img = document.createElement('img');
        img.src = photo.croppedSrc;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';

        photoDiv.appendChild(img);
        exportDiv.appendChild(photoDiv);
      }

      const dataUrl = await toPng(exportDiv, {
        quality: 1.0,
        pixelRatio: 3,
        width: pageWidthPx,
        height: pageHeightPx,
        canvasWidth: pageWidthPx,
        canvasHeight: pageHeightPx,
        backgroundColor: 'white',
        style: {
          margin: '0',
          padding: '0',
          border: 'none'
        }
      });

      document.body.removeChild(tempContainer);

      const img = new Image();
      img.onload = () => {
        if (Math.abs(img.width - pageWidthPx) > 5 || Math.abs(img.height - pageHeightPx) > 5) {
          alert(`图片导出完成！\n预期尺寸: ${pageWidthPx}x${pageHeightPx}px\n实际尺寸: ${img.width}x${img.height}px\n注意: 图片尺寸与预期略有差异。`);
        } else {
          alert(`图片导出完成！\n尺寸: ${img.width}x${img.height}px\n(${(pageSize.name === 'custom' ? customPageSize.width : pageSize.width)}mm × ${(pageSize.name === 'custom' ? customPageSize.height : pageSize.height)}mm @ 300dpi)`);
        }
      };
      img.src = dataUrl;

      const link = document.createElement('a');
      link.download = `证件照拼图-${pageSize.name === 'custom' ? '自定义' : pageSize.name}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error saving image:', error);
      alert('导出图片时发生错误，请重试。');
    }
  }, [pageRef, pageSize, customPageSize, layout, photos]);

  return { saveImage };
};