import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { centerCrop, makeAspectCrop } from 'react-image-crop'
import type { Crop } from 'react-image-crop'

// 计算像素尺寸（基于300dpi）
export const mmToPixels = (mm: number) => Math.round(mm * 11.811)

// 创建图像URL
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.src = url
  })

// 获取裁剪的图像
export const getCroppedImg = async (imageSrc: string, _crop: Crop, scale: number = 1): Promise<string> => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  const crop = {
    x: image.width / 100 * _crop.x,
    y: image.height / 100 * _crop.y,
    width: image.width / 100 * _crop.width,
    height: image.height / 100 * _crop.height,
  }
  
  // 设置canvas尺寸为裁剪区域大小
  canvas.width = crop.width
  canvas.height = crop.height
  
  // 计算缩放后的实际裁剪坐标和尺寸
  const scaleX = image.naturalWidth / (image.width / scale)
  const scaleY = image.naturalHeight / (image.height / scale)
  
  const pixelRatio = window.devicePixelRatio
  
  // 调整裁剪坐标和尺寸，考虑缩放因素
  const cropX = crop.x * scaleX
  const cropY = crop.y * scaleY
  const cropWidth = crop.width * scaleX
  const cropHeight = crop.height * scaleY
  
  // 设置canvas的DPI以提高输出质量
  canvas.width = crop.width * pixelRatio
  canvas.height = crop.height * pixelRatio
  ctx.scale(pixelRatio, pixelRatio)
  ctx.imageSmoothingQuality = 'high'
  
  // 绘制裁剪的图像
  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    crop.width,
    crop.height
  )
  
  // 转换为base64
  return canvas.toDataURL('image/jpeg', 1.0) // 使用最高质量
}

// 初始化裁剪区域
export const centerAspectCrop = (mediaWidth: number, mediaHeight: number, aspect: number) => {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
