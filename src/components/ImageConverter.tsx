import React, { useState, useRef, useEffect } from 'react';
import { FiUpload, FiDownload, FiSettings } from 'react-icons/fi';

interface ConversionFormat {
  label: string;
  value: string;
  mimeType: string;
}

const SUPPORTED_FORMATS: ConversionFormat[] = [
  { label: 'PNG', value: 'png', mimeType: 'image/png' },
  { label: 'JPEG', value: 'jpeg', mimeType: 'image/jpeg' },
  { label: 'WebP', value: 'webp', mimeType: 'image/webp' },
];

const ImageConverter: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [targetFormat, setTargetFormat] = useState<string>('jpeg'); // Default to JPEG which supports quality
  const [compressionQuality, setCompressionQuality] = useState<number>(80);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalSize(file.size);
      setOriginalFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateCompressedSize = () => {
    if (!selectedImage || !originalFile) return;

    // Create an image element to load the original image
    const image = new Image();
    image.src = selectedImage;
    
    image.onload = () => {
      // Create a canvas if it doesn't exist
      if (!canvasRef.current) {
        const canvas = document.createElement('canvas');
        canvasRef.current = canvas;
      }
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas dimensions to match the image
      canvas.width = image.width;
      canvas.height = image.height;
      
      // Clear canvas and draw the image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
      
      // Find the selected format's mime type
      const format = SUPPORTED_FORMATS.find(f => f.value === targetFormat);
      const mimeType = format?.mimeType || 'image/jpeg';
      
      // Apply quality setting for compression (only works for JPEG and WebP)
      const quality = compressionQuality / 100;
      
      // Convert to the target format with quality setting
      let convertedImage: string;
      
      // PNG doesn't support quality parameter, so we ignore it for PNG
      if (targetFormat === 'png') {
        convertedImage = canvas.toDataURL('image/png');
      } else {
        convertedImage = canvas.toDataURL(mimeType, quality);
      }
      
      // Calculate compressed size from the data URL
      const base64 = convertedImage.split(',')[1];
      const binaryString = window.atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      setCompressedSize(bytes.length);
      setPreviewImage(convertedImage);
    };
  };

  // Update compressed size preview when quality or format changes
  useEffect(() => {
    if (selectedImage) {
      calculateCompressedSize();
    }
  }, [compressionQuality, targetFormat, selectedImage]);

  const handleConvert = () => {
    if (!previewImage) return;
    
    // Create download link with size info in filename
    const compressionRate = Math.round((1 - (compressedSize / originalSize)) * 100);
    const filename = `converted-${compressionRate}pct-reduced.${targetFormat}`;
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = previewImage;
    link.click();
  };

  const getCompressionRatio = (): number => {
    if (originalSize === 0 || compressedSize === 0) return 0;
    return Math.round((1 - (compressedSize / originalSize)) * 100);
  };

  // Get the appropriate quality control visibility based on format
  const showQualityControl = targetFormat === 'jpeg' || targetFormat === 'webp';

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Image Converter</h2>
          <p className="text-gray-600 mt-2">Convert and compress your images</p>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          {previewImage ? (
            <div className="space-y-4">
              <img 
                src={previewImage} 
                alt="Selected" 
                className="max-h-64 mx-auto"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <p>Original: {formatFileSize(originalSize)}</p>
                {compressedSize > 0 && (
                  <p>Compressed: {formatFileSize(compressedSize)}</p>
                )}
              </div>
              {compressedSize > 0 && originalSize > 0 && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-700">
                      Compression: {getCompressionRatio()}% reduction
                    </span>
                    <span className="text-xs text-blue-600">
                      {formatFileSize(originalSize - compressedSize)} saved
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${getCompressionRatio()}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setPreviewImage(null);
                  setCompressedSize(0);
                  setOriginalFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="text-red-500 hover:text-red-600"
              >
                Remove Image
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer"
            >
              <FiUpload className="w-12 h-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600">Click to upload or drag and drop</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Convert to:
            </label>
            <select
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {SUPPORTED_FORMATS.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
            {targetFormat === 'png' && (
              <p className="mt-1 text-xs text-amber-600">
                Note: PNG format doesn't support quality adjustment and will maintain full quality.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <FiSettings className="mr-1" />
              {showAdvancedSettings ? 'Hide' : 'Show'} compression settings
            </button>
          </div>

          <div className={`p-4 bg-gray-50 rounded-md ${!showAdvancedSettings && 'hidden'}`}>
            {showQualityControl ? (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compression Quality: {compressionQuality}%
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Low</span>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={compressionQuality}
                    onChange={(e) => setCompressionQuality(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-gray-500">High</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Lower quality = smaller file size, higher quality = better image
                </p>
                {compressedSize > 0 && (
                  <div className="mt-3 text-sm">
                    <p className="font-medium text-gray-700">
                      Quality {compressionQuality}% = {formatFileSize(compressedSize)}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-700">
                Quality adjustment is not available for PNG format. PNG uses lossless compression which preserves all image data.
              </p>
            )}
          </div>

          <button
            onClick={handleConvert}
            disabled={!previewImage}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiDownload className="mr-2" />
            Convert & Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageConverter;
