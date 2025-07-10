// 布局适配器模式实现

import { PhotoItem } from '../types/photo';

// 布局位置接口
export interface LayoutPosition {
  left: number;
  top: number;
  width: number;
  height: number;
  photoId: string;
}

// 布局结果接口
export interface LayoutResult {
  positions: LayoutPosition[];
  totalPhotos: number;
}

// 布局适配器接口
export interface LayoutAdapter {
  name: string;
  description: string;
  calculateLayout(
    pageWidth: number,
    pageHeight: number,
    photos: PhotoItem[],
    margin: {
      horizontal: number;
      vertical: number;
      page?: {
        left: number;
        right: number;
        top: number;
        bottom: number;
      };
    },
    mmToPixels: (mm: number) => number
  ): LayoutResult;
}

// 网格布局适配器
export class GridLayoutAdapter implements LayoutAdapter {
  name = '网格布局';
  description = '按照行列排列照片，适合相同尺寸的照片';

  calculateLayout(
    pageWidth: number,
    pageHeight: number,
    photos: PhotoItem[],
    margin: {
      horizontal: number;
      vertical: number;
      page?: {
        left: number;
        right: number;
        top: number;
        bottom: number;
      };
    },
    mmToPixels: (mm: number) => number
  ): LayoutResult {
    const pageWidthPx = mmToPixels(pageWidth);
    const pageHeightPx = mmToPixels(pageHeight);
    const horizontalMarginPx = mmToPixels(margin.horizontal);
    const verticalMarginPx = mmToPixels(margin.vertical);
    
    // 页面外边距
    const pageMarginLeft = margin.page ? mmToPixels(margin.page.left) : 0;
    const pageMarginRight = margin.page ? mmToPixels(margin.page.right) : 0;
    const pageMarginTop = margin.page ? mmToPixels(margin.page.top) : 0;
    const pageMarginBottom = margin.page ? mmToPixels(margin.page.bottom) : 0;
    
    // 计算可用空间
    const availableWidthPx = pageWidthPx - pageMarginLeft - pageMarginRight;
    const availableHeightPx = pageHeightPx - pageMarginTop - pageMarginBottom;
    
    // 如果没有照片，返回空布局
    if (photos.length === 0) {
      return { positions: [], totalPhotos: 0 };
    }
    
    // 创建一个扩展后的照片数组，考虑重复次数
    const expandedPhotos: PhotoItem[] = [];
    photos.forEach(photo => {
      // 根据repeatCount添加多个相同照片
      for (let i = 0; i < photo.repeatCount; i++) {
        expandedPhotos.push(photo);
      }
    });
    
    let positions: LayoutPosition[] = [];
    let currentX = pageMarginLeft;
    let currentY = pageMarginTop;
    let rowHeight = 0;
    let totalPhotos = 0;
    
    // 对每张照片进行排版
    expandedPhotos.forEach(photo => {
      const photoWidthPx = mmToPixels(photo.size.width);
      const photoHeightPx = mmToPixels(photo.size.height);
      
      // 使用照片自定义边距或全局边距
      const photoHorizontalMargin = photo.margin ? mmToPixels(photo.margin.horizontal) : horizontalMarginPx;
      const photoVerticalMargin = photo.margin ? mmToPixels(photo.margin.vertical) : verticalMarginPx;
      
      // 如果当前行放不下这张照片，换行
      if (currentX + photoWidthPx + photoHorizontalMargin > pageMarginLeft + availableWidthPx) {
        currentX = pageMarginLeft;
        currentY += rowHeight + photoVerticalMargin;
        rowHeight = 0;
      }
      
      // 如果页面高度放不下这张照片，不添加
      if (currentY + photoHeightPx + photoVerticalMargin > pageMarginTop + availableHeightPx) {
        return;
      }
      
      // 添加照片位置
      positions.push({
        left: currentX,
        top: currentY,
        width: photoWidthPx,
        height: photoHeightPx,
        photoId: photo.id
      });
      
      // 更新位置和行高
      currentX += photoWidthPx + photoHorizontalMargin;
      rowHeight = Math.max(rowHeight, photoHeightPx);
      totalPhotos++;
    });
    
    return { positions, totalPhotos };
  }
}

// 紧凑布局适配器
export class CompactLayoutAdapter implements LayoutAdapter {
  name = '紧凑布局';
  description = '使用二叉空间分割算法，最大化利用空间';
  
  calculateLayout(
    pageWidth: number,
    pageHeight: number,
    photos: PhotoItem[],
    margin: {
      horizontal: number;
      vertical: number;
      page?: {
        left: number;
        right: number;
        top: number;
        bottom: number;
      };
    },
    mmToPixels: (mm: number) => number
  ): LayoutResult {
    const pageWidthPx = mmToPixels(pageWidth);
    const pageHeightPx = mmToPixels(pageHeight);
    const horizontalMarginPx = mmToPixels(margin.horizontal);
    const verticalMarginPx = mmToPixels(margin.vertical);
    
    // 页面外边距
    const pageMarginLeft = margin.page ? mmToPixels(margin.page.left) : 0;
    const pageMarginRight = margin.page ? mmToPixels(margin.page.right) : 0;
    const pageMarginTop = margin.page ? mmToPixels(margin.page.top) : 0;
    const pageMarginBottom = margin.page ? mmToPixels(margin.page.bottom) : 0;
    
    // 计算可用空间
    const availableWidthPx = pageWidthPx - pageMarginLeft - pageMarginRight;
    const availableHeightPx = pageHeightPx - pageMarginTop - pageMarginBottom;
    
    // 如果没有照片，返回空布局
    if (photos.length === 0) {
      return { positions: [], totalPhotos: 0 };
    }
    
    // 创建一个扩展后的照片数组，考虑重复次数
    const expandedPhotos: PhotoItem[] = [];
    photos.forEach(photo => {
      // 根据repeatCount添加多个相同照片
      for (let i = 0; i < photo.repeatCount; i++) {
        expandedPhotos.push(photo);
      }
    });
    
    // 按照面积从大到小排序照片，优先放置大照片
    const sortedPhotos = [...expandedPhotos].sort((a, b) => {
      const areaA = a.size.width * a.size.height;
      const areaB = b.size.width * b.size.height;
      return areaB - areaA;
    });
    
    // 二叉空间分割节点
    interface Node {
      x: number;
      y: number;
      width: number;
      height: number;
      used?: boolean;
      right?: Node;
      down?: Node;
    }
    
    // 根节点
    const root: Node = {
      x: pageMarginLeft,
      y: pageMarginTop,
      width: availableWidthPx,
      height: availableHeightPx
    };
    
    // 找到合适的节点放置照片
    const findNode = (root: Node, width: number, height: number): Node | null => {
      // 如果节点已被使用，尝试在右侧或下方子节点中查找
      if (root.used) {
        return findNode(root.right!, width, height) || findNode(root.down!, width, height);
      }
      
      // 检查当前节点是否足够大
      if (width <= root.width && height <= root.height) {
        return root;
      }
      
      return null;
    };
    
    // 在节点中放置照片
    const splitNode = (node: Node, width: number, height: number, photo?: PhotoItem): Node => {
      node.used = true;
      
      // 使用照片自定义边距或全局边距
      const photoHorizontalMargin = photo?.margin ? mmToPixels(photo.margin.horizontal) : horizontalMarginPx;
      const photoVerticalMargin = photo?.margin ? mmToPixels(photo.margin.vertical) : verticalMarginPx;
      
      // 创建右侧子节点
      node.right = {
        x: node.x + width + photoHorizontalMargin,
        y: node.y,
        width: node.width - width - photoHorizontalMargin,
        height: height
      };
      
      // 创建下方子节点
      node.down = {
        x: node.x,
        y: node.y + height + photoVerticalMargin,
        width: node.width,
        height: node.height - height - photoVerticalMargin
      };
      
      return node;
    };
    
    // 放置照片
    const positions: LayoutPosition[] = [];
    let totalPhotos = 0;
    
    for (const photo of sortedPhotos) {
      const photoWidthPx = mmToPixels(photo.size.width);
      const photoHeightPx = mmToPixels(photo.size.height);
      
      // 找到合适的位置
      const node = findNode(root, photoWidthPx, photoHeightPx);
      
      if (node) {
        // 放置照片
        splitNode(node, photoWidthPx, photoHeightPx, photo);
        
        positions.push({
          left: node.x,
          top: node.y,
          width: photoWidthPx,
          height: photoHeightPx,
          photoId: photo.id
        });
        
        totalPhotos++;
      }
    }
    
    return { positions, totalPhotos };
  }
}

// 自适应布局适配器
export class AdaptiveLayoutAdapter implements LayoutAdapter {
  name = '自适应布局';
  description = '根据照片尺寸自动调整排列方式，平衡空间利用和排列整齐度';
  
  calculateLayout(
    pageWidth: number,
    pageHeight: number,
    photos: PhotoItem[],
    margin: {
      horizontal: number;
      vertical: number;
      page?: {
        left: number;
        right: number;
        top: number;
        bottom: number;
      };
    },
    mmToPixels: (mm: number) => number
  ): LayoutResult {
    const pageWidthPx = mmToPixels(pageWidth);
    const pageHeightPx = mmToPixels(pageHeight);
    const horizontalMarginPx = mmToPixels(margin.horizontal);
    const verticalMarginPx = mmToPixels(margin.vertical);
    
    // 页面外边距
    const pageMarginLeft = margin.page ? mmToPixels(margin.page.left) : 0;
    const pageMarginRight = margin.page ? mmToPixels(margin.page.right) : 0;
    const pageMarginTop = margin.page ? mmToPixels(margin.page.top) : 0;
    const pageMarginBottom = margin.page ? mmToPixels(margin.page.bottom) : 0;
    
    // 计算可用空间
    const availableWidthPx = pageWidthPx - pageMarginLeft - pageMarginRight;
    const availableHeightPx = pageHeightPx - pageMarginTop - pageMarginBottom;
    
    // 如果没有照片，返回空布局
    if (photos.length === 0) {
      return { positions: [], totalPhotos: 0 };
    }
    
    // 创建一个扩展后的照片数组，考虑重复次数
    const expandedPhotos: PhotoItem[] = [];
    photos.forEach(photo => {
      // 根据repeatCount添加多个相同照片
      for (let i = 0; i < photo.repeatCount; i++) {
        expandedPhotos.push(photo);
      }
    });
    
    // 按照尺寸分组
    const photoGroups: { [key: string]: PhotoItem[] } = {};
    expandedPhotos.forEach(photo => {
      const sizeKey = `${photo.size.width}x${photo.size.height}`;
      if (!photoGroups[sizeKey]) {
        photoGroups[sizeKey] = [];
      }
      photoGroups[sizeKey].push(photo);
    });
    
    // 对每组照片进行排版
    let positions: LayoutPosition[] = [];
    let totalPhotos = 0;
    let currentY = pageMarginTop;
    
    // 按照尺寸从大到小排序组
    const groupKeys = Object.keys(photoGroups).sort((a, b) => {
      const [widthA, heightA] = a.split('x').map(Number);
      const [widthB, heightB] = b.split('x').map(Number);
      return (widthB * heightB) - (widthA * heightA);
    });
    
    for (const groupKey of groupKeys) {
      const group = photoGroups[groupKey];
      const [width, height] = groupKey.split('x').map(Number);
      const photoWidthPx = mmToPixels(width);
      const photoHeightPx = mmToPixels(height);
      
      // 计算每行可以放置的照片数量
      const photosPerRow = Math.floor((availableWidthPx) / (photoWidthPx + horizontalMarginPx));
      
      // 对当前组的照片进行排版
      let currentX = pageMarginLeft;
      let rowCount = 0;
      
      group.forEach(photo => {
        // 使用照片自定义边距或全局边距
        const photoHorizontalMargin = photo.margin ? mmToPixels(photo.margin.horizontal) : horizontalMarginPx;
        const photoVerticalMargin = photo.margin ? mmToPixels(photo.margin.vertical) : verticalMarginPx;
        
        // 如果当前行已满，换行
        if (rowCount >= photosPerRow) {
          currentX = pageMarginLeft;
          currentY += photoHeightPx + photoVerticalMargin;
          rowCount = 0;
        }
        
        // 如果页面高度放不下这张照片，不添加
        if (currentY + photoHeightPx + photoVerticalMargin > pageMarginTop + availableHeightPx) {
          return;
        }
        
        // 添加照片位置
        positions.push({
          left: currentX,
          top: currentY,
          width: photoWidthPx,
          height: photoHeightPx,
          photoId: photo.id
        });
        
        // 更新位置
        currentX += photoWidthPx + photoHorizontalMargin;
        rowCount++;
        totalPhotos++;
      });
      
      // 组之间添加额外间距
      currentY += photoHeightPx + verticalMarginPx * 2;
    }
    
    return { positions, totalPhotos };
  }
}

// 导出所有布局适配器
export const layoutAdapters: LayoutAdapter[] = [
  new GridLayoutAdapter(),
  new CompactLayoutAdapter(),
  new AdaptiveLayoutAdapter()
];

// 获取默认布局适配器
export const getDefaultLayoutAdapter = (): LayoutAdapter => {
  return layoutAdapters[0]; // 默认使用网格布局
};
