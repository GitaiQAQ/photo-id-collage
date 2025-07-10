import { useState, useRef, useEffect } from 'react'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import './App.css'

// 导入类型定义

// 导入常量
import { PAGE_SIZES } from './constants'

// 导入布局适配器
import { 
  layoutAdapters} from './lib/layoutAdapters'

// 导入图像处理适配器
import {
  getDefaultImageProcessor,
  ImageProcessor
} from './lib/imageProcessors'

// 导入工具函数
import { mmToPixels } from './lib/utils'

// 导入功能组件
import { PageConfig } from './components/feature/PageConfig'
import { PhotoUploadConfig } from './components/feature/PhotoUploadConfig'

// UI组件
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

// 图标
import { 
  Upload, 
  Image as ImageIcon, 
  Grid, 
  Download, 
  Crop as CropIcon, 
  ZoomIn, 
  ZoomOut, 
  Check, 
  X, 
  Info,
  Loader2
} from 'lucide-react'

import { usePageSize } from './hooks/usePageSize';
import { usePhotos } from './hooks/usePhotos';
import { useCrop } from './hooks/useCrop';
import { useLayout } from './hooks/useLayout';
import { useSaveImage } from './hooks/useSaveImage';

function App() {
  const [margin, setMargin] = useState<{
    horizontal: number;
    vertical: number;
    page?: {
      left: number;
      right: number;
      top: number;
      bottom: number;
    };
  }>({
    horizontal: PAGE_SIZES[0].defaultMargin,
    vertical: PAGE_SIZES[0].defaultMargin,
    page: {
      left: 5,
      right: 5,
      top: 10,
      bottom: 10
    }
  });
  const [showAntLines, setShowAntLines] = useState(true);
  const [previewScale, setPreviewScale] = useState(1);
  const [configPreviewScale, setConfigPreviewScale] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentImageProcessor] = useState<ImageProcessor>(getDefaultImageProcessor());
  const [selectedBackgroundColor, setSelectedBackgroundColor] = useState('#FFFFFF');

  const imgRef = useRef<HTMLImageElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const configPreviewRef = useRef<HTMLDivElement>(null);

  const { pageSize, customPageSize, customSizes, setCustomSizes, handlePageSizeChange, handleCustomSizeChange } = usePageSize();
  const { photos, setPhotos, handlePhotoUpload, handlePhotoSizeChange, removePhoto, duplicatePhoto } = usePhotos();
  const { layout, updateLayout, currentLayoutAdapter, handleLayoutAdapterChange } = useLayout();
  const { currentPhotoIndex, setCurrentPhotoIndex, imgSrc, crop, setCrop, completedCrop, setCompletedCrop, scale, setScale, processingImage, openCropDialog, onImageLoad, processImageBackground, saveCrop } = useCrop(photos, setPhotos, currentImageProcessor);
  const { saveImage } = useSaveImage(pageRef, pageSize, customPageSize, layout, photos);

  useEffect(() => {
    const currentWidth = pageSize.name === 'custom' ? customPageSize.width : pageSize.width;
    const currentHeight = pageSize.name === 'custom' ? customPageSize.height : pageSize.height;
    updateLayout(currentWidth, currentHeight, photos, margin);
  }, [photos, pageSize, customPageSize, margin, currentLayoutAdapter, updateLayout]);
  
  // 计算页面预览尺寸（等比例缩放）
  const calculatePagePreviewSize = () => {
    const maxWidth = 800
    const maxHeight = 600
    const aspectRatio = (pageSize.name === 'custom' ? customPageSize.width : pageSize.width) / 
                        (pageSize.name === 'custom' ? customPageSize.height : pageSize.height)
    
    if ((pageSize.name === 'custom' ? customPageSize.width : pageSize.width) > 
        (pageSize.name === 'custom' ? customPageSize.height : pageSize.height)) {
      return {
        width: maxWidth,
        height: Math.round(maxWidth / aspectRatio)
      }
    } else {
      return {
        width: Math.round(maxHeight * aspectRatio),
        height: maxHeight
      }
    }
  }
  
  const pagePreviewSize = calculatePagePreviewSize()

  // 自动适应缩放页面配置预览
  useEffect(() => {
    if (configPreviewRef.current) {
      const containerWidth = configPreviewRef.current.offsetWidth
      const containerHeight = configPreviewRef.current.offsetHeight
      
      const pageWidth = pageSize.name === 'custom' ? customPageSize.width : pageSize.width
      const pageHeight = pageSize.name === 'custom' ? customPageSize.height : pageSize.height
      
      // 计算适合容器的缩放比例
      const widthScale = (containerWidth - 40) / pageWidth
      const heightScale = (containerHeight - 40) / pageHeight
      
      // 选择较小的缩放比例，确保页面完全显示在容器内
      const scale = Math.min(widthScale, heightScale, 1) // 最大缩放为1
      
      setConfigPreviewScale(scale)
    }
  }, [pageSize, customPageSize, configPreviewRef])
  
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">证件照拼图工具</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            上传照片、选择尺寸、裁剪照片，自动排版并保存打印
          </p>
        </header>
        
        <Tabs defaultValue="config">
          <TabsList className="mb-6">
            <TabsTrigger value="config">
              <div className="flex items-center gap-2">
                <Grid size={16} />
                <span>页面配置</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="upload">
              <div className="flex items-center gap-2">
                <Upload size={16} />
                <span>上传照片</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="layout">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} />
                <span>排版预览</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          {/* 页面配置 */}
          <TabsContent value="config">
            <PageConfig
              pageSize={pageSize}
              customPageSize={customPageSize}
              customSizes={customSizes}
              configPreviewRef={configPreviewRef}
              configPreviewScale={configPreviewScale}
              handlePageSizeChange={handlePageSizeChange}
              handleCustomSizeChange={handleCustomSizeChange}
              setCustomSizes={setCustomSizes}
              setConfigPreviewScale={setConfigPreviewScale}
            />
          </TabsContent>
          
          {/* 上传照片 */}
          <TabsContent value="upload">
            <PhotoUploadConfig
              photos={photos}
              setPhotos={setPhotos}
              viewMode={viewMode}
              setViewMode={setViewMode}
              handlePhotoUpload={handlePhotoUpload}
              handlePhotoSizeChange={handlePhotoSizeChange}
              pageSize={pageSize}
              customPageSize={customPageSize}
              updateLayout={updateLayout}
              margin={margin}
              openCropDialog={openCropDialog}
              duplicatePhoto={duplicatePhoto}
              removePhoto={removePhoto}
            />
            
            {/* 裁剪对话框 */}
            <Dialog open={currentPhotoIndex !== null} onOpenChange={(open) => !open && setCurrentPhotoIndex(null)}>
              <DialogContent className="max-w-3xl w-[95vw] sm:w-auto max-h-[90vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>裁剪照片</DialogTitle>
                </DialogHeader>
                
                <div className="grid grid-cols-1 gap-4">
                  {imgSrc && currentPhotoIndex !== null && (
                    <>
                      <div className="crop-container border rounded-md overflow-hidden bg-gray-100">
                        <ReactCrop
                          crop={crop}
                          onChange={(_, percentCrop) => setCrop(percentCrop)}
                          onComplete={(_c, pc) => {
                            setCompletedCrop(pc);
                          }}
                          aspect={photos[currentPhotoIndex]?.size.width / photos[currentPhotoIndex]?.size.height}
                          minWidth={50}
                        >
                          <img
                            ref={imgRef}
                            alt="裁剪"
                            src={imgSrc}
                            style={{ transform: `scale(${scale})` }}
                            onLoad={onImageLoad}
                          />
                        </ReactCrop>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setScale(scale - 0.1)}
                            disabled={scale <= 0.5}
                          >
                            <ZoomOut size={16} />
                          </Button>
                          <span className="text-sm">缩放: {Math.round(scale * 100)}%</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setScale(scale + 0.1)}
                            disabled={scale >= 3}
                          >
                            <ZoomIn size={16} />
                          </Button>
                        </div>
                        
                        <div>
                          <Button variant="outline" size="sm" className="mr-2" onClick={() => setCurrentPhotoIndex(null)}>
                            <X size={16} className="mr-1" />
                            取消
                          </Button>
                          <Button size="sm" onClick={saveCrop} disabled={!completedCrop?.width}>
                            <Check size={16} className="mr-1" />
                            确认裁剪
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="text-xs text-gray-500">
                          <p>提示：拖动裁剪框调整位置，确保人脸在框内居中。裁剪框比例已锁定为 {photos[currentPhotoIndex]?.size.name} 证件照比例。</p>
                        </div>
                        
                        {/* AI功能预留区域 */}
                        <div className="border border-dashed border-gray-300 rounded-md p-3 sm:p-4 bg-gray-50">
                          <h3 className="text-sm font-medium mb-2">AI 功能区</h3>
                          
                          {/* 背景色更换功能 */}
                          <div className="mb-3">
                            <h4 className="text-xs font-medium mb-2">更换背景色</h4>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {["#FFFFFF", "#0000FF", "#FF0000", "#00FF00", "#FFFF00", "#FF00FF"].map((color) => (
                                <Button
                                  key={color}
                                  className="w-8 h-8 p-0 rounded-full"
                                  style={{ backgroundColor: color }}
                                  onClick={() => processImageBackground(color)}
                                  disabled={processingImage}
                                />
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <label htmlFor="custom-color" className="text-xs">自定义:</label>
                              <input
                                id="custom-color"
                                type="color"
                                value={selectedBackgroundColor}
                                onChange={(e) => setSelectedBackgroundColor(e.target.value)}
                                className="w-8 h-8 p-0 border-0"
                              />
                              <Button 
                                size="sm" 
                                onClick={() => processImageBackground(selectedBackgroundColor)}
                                disabled={processingImage}
                              >
                                应用
                              </Button>
                            </div>
                            
                            {processingImage && (
                              <div className="flex items-center justify-center mt-2 text-xs text-blue-500">
                                <Loader2 className="animate-spin mr-1" size={14} />
                                <span>处理中...</span>
                              </div>
                            )}
                          </div>
                          
                          <Separator className="my-2" />
                          
                          {/* 其他AI功能 */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" disabled className="flex items-center justify-center">
                              <div className="mr-2 w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-500 text-xs">AI</span>
                              </div>
                              人脸识别 + 自动裁切
                            </Button>
                            <Button variant="outline" size="sm" disabled className="flex items-center justify-center">
                              <div className="mr-2 w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-500 text-xs">AI</span>
                              </div>
                              美颜优化
                            </Button>
                            <Button variant="outline" size="sm" disabled className="flex items-center justify-center">
                              <div className="mr-2 w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-500 text-xs">AI</span>
                              </div>
                              智能修复
                            </Button>
                          </div>
                          <p className="mt-2 text-xs text-gray-400">更多AI功能即将上线，敬请期待</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
          
          {/* 排版预览 */}
          <TabsContent value="layout">
            <Card>
              <CardHeader>
                <CardTitle>排版预览</CardTitle>
              </CardHeader>
              <CardContent>
                {photos.length === 0 ? (
                  <div className="text-center py-8">
                    <ImageIcon size={48} className="mx-auto text-gray-300" />
                    <p className="mt-2 text-gray-500">请先上传照片</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => document.querySelector('[value="upload"]')?.dispatchEvent(new MouseEvent('click'))}
                    >
                      <Upload size={16} className="mr-2" />
                      去上传照片
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <div className="relative overflow-hidden border border-gray-200 rounded-md">
                        {/* 缩放控制 */}
                        <div className="absolute top-2 right-2 flex items-center space-x-2 bg-white rounded-md shadow-sm p-1 z-20 zoom-control">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPreviewScale(Math.max(0.5, previewScale - 0.1))}
                            disabled={previewScale <= 0.5}
                          >
                            <ZoomOut size={16} />
                          </Button>
                          <span className="text-xs font-medium">{Math.round(previewScale * 100)}%</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPreviewScale(Math.min(3, previewScale + 0.1))}
                            disabled={previewScale >= 3}
                          >
                            <ZoomIn size={16} />
                          </Button>
                        </div>
                        
                        <div className="overflow-auto" style={{ maxHeight: 'calc(70vh - 100px)', maxWidth: '100%' }}>
                          <div
                            ref={pageRef}
                            className="page-preview mx-auto relative"
                            style={{
                              width: pagePreviewSize.width * previewScale,
                              height: pagePreviewSize.height * previewScale,
                              backgroundColor: 'white',
                              transformOrigin: 'top left'
                            }}
                          >
                            {/* 蚂蚁线网格 - 仅在开启蚂蚁线时显示 */}
                            {showAntLines && (
                              <div className="absolute inset-0">
                                {/* 水平蚂蚁线 - 在照片行之间 */}
                                {(() => {
                                  if (layout.positions.length === 0) return null;
                                  
                                  // 找出所有不同的行（基于top坐标）
                                  const rows = [...new Set(layout.positions.map(pos => pos.top + pos.height))].sort((a, b) => a - b);
                                  
                                  return rows.map((rowEnd, idx) => {
                                    // 跳过最后一行的底部线
                                    if (idx === rows.length - 1) return null;
                                    
                                    const nextRowStart = [...new Set(layout.positions.map(pos => pos.top))].sort((a, b) => a - b)[idx + 1];
                                    
                                    // 计算行之间的中点位置
                                    const lineY = (rowEnd + nextRowStart) / 2;
                                    
                                    // 转换为预览尺寸
                                    const y = lineY / mmToPixels(pageSize.name === 'custom' ? customPageSize.height : pageSize.height) * pagePreviewSize.height * previewScale;
                                    
                                    return (
                                      <div key={`h-antline-${idx}`} className="absolute" style={{
                                        left: '0px',
                                        top: `${y}px`,
                                        width: '100%',
                                        height: '1px',
                                        borderTop: '1px dashed #ddd',
                                        pointerEvents: 'none',
                                        zIndex: 4
                                      }} />
                                    );
                                  });
                                })()}
                                
                                {/* 垂直蚂蚁线 - 在照片列之间 */}
                                {(() => {
                                  if (layout.positions.length === 0) return null;
                                  
                                  // 找出所有不同的列（基于left坐标）
                                  const columns = [...new Set(layout.positions.map(pos => pos.left + pos.width))].sort((a, b) => a - b);
                                  
                                  return columns.map((colEnd, idx) => {
                                    // 跳过最后一列的右侧线
                                    if (idx === columns.length - 1) return null;
                                    
                                    const nextColStart = [...new Set(layout.positions.map(pos => pos.left))].sort((a, b) => a - b)[idx + 1];
                                    
                                    // 计算列之间的中点位置
                                    const lineX = (colEnd + nextColStart) / 2;
                                    
                                    // 转换为预览尺寸
                                    const x = lineX / mmToPixels(pageSize.name === 'custom' ? customPageSize.width : pageSize.width) * pagePreviewSize.width * previewScale;
                                    
                                    return (
                                      <div key={`v-antline-${idx}`} className="absolute" style={{
                                        left: `${x}px`,
                                        top: '0px',
                                        width: '1px',
                                        height: '100%',
                                        borderLeft: '1px dashed #ddd',
                                        pointerEvents: 'none',
                                        zIndex: 4
                                      }} />
                                    );
                                  });
                                })()}
                              </div>
                            )}
                            
                            {/* 照片排版 */}
                            {layout.positions.map((pos, index) => {
                              // 根据photoId查找对应的照片
                              const photo = photos.find(p => p.id === pos.photoId)
                              if (!photo) return null
                              
                              // 找出照片在原数组中的索引
                              const photoIndex = photos.findIndex(p => p.id === pos.photoId)
                              
                              return (
                                <div
                                  key={`pos-${index}`}
                                  className="photo-placeholder absolute"
                                  style={{
                                    left: pos.left / mmToPixels(pageSize.name === 'custom' ? customPageSize.width : pageSize.width) * pagePreviewSize.width * previewScale,
                                    top: pos.top / mmToPixels(pageSize.name === 'custom' ? customPageSize.height : pageSize.height) * pagePreviewSize.height * previewScale,
                                    width: pos.width / mmToPixels(pageSize.name === 'custom' ? customPageSize.width : pageSize.width) * pagePreviewSize.width * previewScale,
                                    height: pos.height / mmToPixels(pageSize.name === 'custom' ? customPageSize.height : pageSize.height) * pagePreviewSize.height * previewScale,
                                    border: '1px solid #e5e7eb',
                                    zIndex: 5
                                  }}
                                >
                                  {photo.croppedSrc ? (
                                    <img
                                      src={photo.croppedSrc}
                                      alt={`照片 ${photoIndex + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center justify-center w-full h-full text-xs text-gray-400">
                                      <CropIcon size={16} className="mb-1" />
                                      <span>请先裁剪</span>
                                    </div>
                                  )}
                                  
                                  {/* 显示照片ID */}
                                  <div className="absolute top-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded-sm z-10 photo-id-marker">
                                    #{photoIndex + 1}
                                  </div>
                                  
                                  {/* 显示当前下标 */}
                                  {photo.repeatCount > 1 && (
                                    <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 rounded-sm z-10 photo-count-marker">
                                      ×{index + 1}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">
                          页面尺寸: {pageSize.name === 'custom' ? '自定义' : pageSize.name} {pageSize.name === 'custom' ? customPageSize.width : pageSize.width} × {pageSize.name === 'custom' ? customPageSize.height : pageSize.height} mm (约 {mmToPixels(pageSize.name === 'custom' ? customPageSize.width : pageSize.width)} × {mmToPixels(pageSize.name === 'custom' ? customPageSize.height : pageSize.height)} 像素 @300dpi)
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="font-medium mb-3">排版信息</h3>
                        
                        <div className="space-y-4 text-sm">
                          <p>
                            <span className="font-medium">照片数量:</span> {photos.length} 张上传, 
                            {layout.totalPhotos} 张可排版
                          </p>
                          
                          {/* 布局算法选择 */}
                          <div>
                            <Label htmlFor="layout-algorithm">布局算法</Label>
                            <Select
                              value={currentLayoutAdapter.name}
                              onValueChange={handleLayoutAdapterChange}
                            >
                              <SelectTrigger id="layout-algorithm" className="mt-1">
                                <SelectValue placeholder="选择布局算法" />
                              </SelectTrigger>
                              <SelectContent>
                                {layoutAdapters.map(adapter => (
                                  <SelectItem key={adapter.name} value={adapter.name}>
                                    {adapter.name} - {adapter.description}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* 照片间距设置 */}
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="horizontal-margin-slider">水平间距 ({margin.horizontal}mm)</Label>
                              <Slider
                                id="horizontal-margin-slider"
                                min={1}
                                max={20}
                                step={1}
                                value={[margin.horizontal]}
                                onValueChange={(values) => {
                                  setMargin({
                                    ...margin,
                                    horizontal: values[0]
                                  });
                                  
                                  const currentWidth = pageSize.name === 'custom' ? customPageSize.width : pageSize.width;
                                  const currentHeight = pageSize.name === 'custom' ? customPageSize.height : pageSize.height;
                                  
                                  updateLayout(currentWidth, currentHeight, photos, margin);
                                }}
                                className="mt-2"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="vertical-margin-slider">垂直间距 ({margin.vertical}mm)</Label>
                              <Slider
                                id="vertical-margin-slider"
                                min={1}
                                max={20}
                                step={1}
                                value={[margin.vertical]}
                                onValueChange={(values) => {
                                  setMargin({
                                    ...margin,
                                    vertical: values[0]
                                  });
                                  
                                  const currentWidth = pageSize.name === 'custom' ? customPageSize.width : pageSize.width;
                                  const currentHeight = pageSize.name === 'custom' ? customPageSize.height : pageSize.height;
                                  
                                  updateLayout(currentWidth, currentHeight, photos, margin);
                                }}
                                className="mt-2"
                              />
                            </div>
                            
                            <Separator className="my-2" />
                            
                            <div>
                              <div className="flex items-center justify-between">
                                <Label>页面外边距设置</Label>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setMargin({
                                      ...margin,
                                      page: {
                                        left: 0,
                                        right: 0,
                                        top: 0,
                                        bottom: 0
                                      }
                                    });
                                    updateLayout(
                                      pageSize.name === 'custom' ? customPageSize.width : pageSize.width,
                                      pageSize.name === 'custom' ? customPageSize.height : pageSize.height,
                                      photos, margin
                                    );
                                  }}
                                >
                                  重置
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-2">
                                <div>
                                  <Label htmlFor="page-margin-left" className="text-xs sm:text-sm">左边距 (mm)</Label>
                                  <Input
                                    id="page-margin-left"
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={margin.page?.left || 0}
                                    onChange={(e) => {
                                      const value = Math.max(0, Math.min(50, parseFloat(e.target.value) || 0));
                                      setMargin({
                                        ...margin,
                                        page: {
                                          ...(margin.page || { left: 0, right: 0, top: 0, bottom: 0 }),
                                          left: value
                                        }
                                      });
                                      updateLayout(
                                        pageSize.name === 'custom' ? customPageSize.width : pageSize.width,
                                        pageSize.name === 'custom' ? customPageSize.height : pageSize.height,
                                        photos, margin
                                      );
                                    }}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="page-margin-right" className="text-xs sm:text-sm">右边距 (mm)</Label>
                                  <Input
                                    id="page-margin-right"
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={margin.page?.right || 0}
                                    onChange={(e) => {
                                      const value = Math.max(0, Math.min(50, parseFloat(e.target.value) || 0));
                                      setMargin({
                                        ...margin,
                                        page: {
                                          ...(margin.page || { left: 0, right: 0, top: 0, bottom: 0 }),
                                          right: value
                                        }
                                      });
                                      updateLayout(
                                        pageSize.name === 'custom' ? customPageSize.width : pageSize.width,
                                        pageSize.name === 'custom' ? customPageSize.height : pageSize.height,
                                        photos, margin
                                      );
                                    }}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="page-margin-top" className="text-xs sm:text-sm">上边距 (mm)</Label>
                                  <Input
                                    id="page-margin-top"
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={margin.page?.top || 0}
                                    onChange={(e) => {
                                      const value = Math.max(0, Math.min(50, parseFloat(e.target.value) || 0));
                                      setMargin({
                                        ...margin,
                                        page: {
                                          ...(margin.page || { left: 0, right: 0, top: 0, bottom: 0 }),
                                          top: value
                                        }
                                      });
                                      updateLayout(
                                        pageSize.name === 'custom' ? customPageSize.width : pageSize.width,
                                        pageSize.name === 'custom' ? customPageSize.height : pageSize.height,
                                        photos, margin
                                      );
                                    }}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="page-margin-bottom" className="text-xs sm:text-sm">下边距 (mm)</Label>
                                  <Input
                                    id="page-margin-bottom"
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={margin.page?.bottom || 0}
                                    onChange={(e) => {
                                      const value = Math.max(0, Math.min(50, parseFloat(e.target.value) || 0));
                                      setMargin({
                                        ...margin,
                                        page: {
                                          ...(margin.page || { left: 0, right: 0, top: 0, bottom: 0 }),
                                          bottom: value
                                        }
                                      });
                                      updateLayout(
                                        pageSize.name === 'custom' ? customPageSize.width : pageSize.width,
                                        pageSize.name === 'custom' ? customPageSize.height : pageSize.height,
                                        photos, margin
                                      );
                                    }}
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* 蚂蚁线设置 */}
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="ant-lines"
                              checked={showAntLines}
                              onCheckedChange={setShowAntLines}
                            />
                            <Label htmlFor="ant-lines">显示蚂蚁线（裁剪辅助线）</Label>
                          </div>
                          
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">照片状态</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {photos.map((photo, index) => {
                                // 计算该照片在布局中出现的次数
                                const placedCount = layout.positions.filter(pos => pos.photoId === photo.id).length;
                                // 计算该照片预期的重复次数
                                const expectedCount = photo.repeatCount;
                                
                                return (
                                  <div key={photo.id} className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full ${photo.croppedSrc ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}></div>
                                    <span>
                                      照片 {index + 1}: {photo.croppedSrc ? '已裁剪' : '未裁剪'} 
                                      {photo.croppedSrc && (
                                        <>
                                          <span className="mx-1">|</span>
                                          <span className={placedCount < expectedCount ? 'text-amber-600 font-medium' : 'text-green-600'}>
                                            {placedCount}/{expectedCount}
                                          </span>
                                          <span className="ml-1">{photo.size.name} ({photo.size.width}×{photo.size.height}mm)</span>
                                        </>
                                      )}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* 显示无法排进当前页面的照片数量 */}
                            {(() => {
                              // 计算预期的总照片数
                              const expectedTotal = photos.reduce((sum, photo) => sum + photo.repeatCount, 0);
                              // 计算实际排版的照片数
                              const actualTotal = layout.totalPhotos;
                              
                              if (expectedTotal > actualTotal) {
                                return (
                                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-xs">
                                    <div className="flex items-center">
                                      <Info size={14} className="mr-1" />
                                      <span>
                                        有 <strong>{expectedTotal - actualTotal}</strong> 张照片无法排进当前页面。
                                        建议调整页面尺寸、减少照片数量或调整边距。
                                      </span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                          
                          <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                            <Info size={16} />
                            <AlertDescription>
                              {photos.some(p => !p.croppedSrc) 
                                ? '有照片尚未裁剪，请返回上一步完成裁剪。' 
                                : '所有照片已裁剪完成，可以保存打印。'}
                            </AlertDescription>
                          </Alert>
                          
                          <Button
                            className="w-full"
                            disabled={photos.some(p => !p.croppedSrc)}
                            onClick={saveImage}
                          >
                            <Download size={16} className="mr-2" />
                            保存为图片
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="text-sm font-medium mb-2">AI功能预留区域</h3>
                        <div className="border border-dashed border-gray-300 rounded-md p-3 sm:p-4 bg-gray-50">
                          <p className="text-xs sm:text-sm text-gray-500">
                            此区域预留用于未来AI功能，如自动换底色、人脸识别和自动裁剪等。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
