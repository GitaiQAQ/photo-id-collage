// 图像处理适配器模式实现

// 图像处理结果接口
export interface ImageProcessResult {
  processedImageSrc: string;
}

// 图像处理适配器接口
export interface ImageProcessor {
  name: string;
  description: string;
  process(imageSrc: string, options?: any): Promise<ImageProcessResult>;
}

// 背景色更换适配器
export class BackgroundColorProcessor implements ImageProcessor {
  name = '背景色更换';
  description = '更换图像背景色';
  
  async process(imageSrc: string, options: { color: string } = { color: '#FFFFFF' }): Promise<ImageProcessResult> {
    try {
      // 创建一个Image对象加载原始图像
      const image = await this.loadImage(imageSrc);
      
      // 创建canvas并绘制图像
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法获取canvas上下文');
      }
      
      // 绘制原始图像
      ctx.drawImage(image, 0, 0);
      
      // 获取图像数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // 解析目标背景色
      const targetColor = this.hexToRgb(options.color);
      if (!targetColor) {
        throw new Error('无效的颜色格式');
      }
      
      // 背景色替换算法
      // 这里使用一个简单的阈值算法，可以根据需要调整或使用更复杂的算法
      const threshold = 240; // 亮度阈值，大于此值的像素被认为是背景
      
      for (let i = 0; i < data.length; i += 4) {
        // 计算像素亮度
        const brightness = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
        
        // 检查是否是背景像素（亮度高的通常是背景）
        if (brightness > threshold) {
          // 替换为目标背景色
          data[i] = targetColor.r;     // 红色
          data[i + 1] = targetColor.g; // 绿色
          data[i + 2] = targetColor.b; // 蓝色
          // 保持原来的透明度
        }
      }
      
      // 将处理后的图像数据放回canvas
      ctx.putImageData(imageData, 0, 0);
      
      // 转换为base64
      const processedImageSrc = canvas.toDataURL('image/jpeg', 1.0);
      
      return { processedImageSrc };
    } catch (error) {
      console.error('背景色更换处理失败:', error);
      throw error;
    }
  }
  
  // 辅助方法：加载图像
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
  
  // 辅助方法：将十六进制颜色转换为RGB
  private hexToRgb(hex: string): { r: number, g: number, b: number } | null {
    // 移除可能的#前缀
    hex = hex.replace(/^#/, '');
    
    // 处理缩写形式 (例如 #03F -> #0033FF)
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null;
  }
}

// 导出所有图像处理适配器
export const imageProcessors: ImageProcessor[] = [
  new BackgroundColorProcessor(),
];

// 获取默认图像处理适配器
export const getDefaultImageProcessor = (): ImageProcessor => {
  return imageProcessors[0]; // 默认使用背景色更换处理器
};