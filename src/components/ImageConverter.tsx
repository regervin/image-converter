import React, { useState, useRef } from 'react';
import { FiUpload, FiDownload, FiSettings } from 'react-icons/fi';

interface ConversionOptions {
  format: 'jpeg' | 'png' | 'webp' | 'gif';
  quality: number;
  resize: boolean;
  width: number;
  height: number;
}

const ImageConverter: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<ConversionOptions>({
    format: 'jpeg',
    quality: 80,
    resize: false,
    width: 800,
    height: 600,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Reset converted image
      setConvertedUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Reset converted image
      setConvertedUrl(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleConvert = async () => {
    if (!selectedImage) return;
    
    setIsConverting(true);
    
    try {
      // In a real app, you would send the image to a server for conversion
      // or use a library like browser-image-compression
      // For this demo, we'll simulate conversion by creating a canvas
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Apply resize if enabled
        if (options.resize) {
          width = options.width;
          height = options.height;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to the selected format with quality
          const format = `image/${options.format}`;
          const quality = options.quality / 100;
          const dataUrl = canvas.toDataURL(format, quality);
          
          setConvertedUrl(dataUrl);
          setIsConverting(false);
        }
      };
      
      img.src = previewUrl as string;
    } catch (error) {
      console.error('Error converting image:', error);
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedUrl) return;
    
    const link = document.createElement('a');
    link.href = convertedUrl;
    link.download = `converted-image.${options.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOptionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setOptions({
      ...options,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? parseInt(value, 10) 
          : value,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Image Converter</h1>
        <p className="text-gray-600 mt-2">
          Convert your images to different formats with ease
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Upload Section */}
        <div 
          className="p-6 border-b border-gray-200"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Upload Image</h2>
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="flex items-center text-blue-500 hover:text-blue-700"
            >
              <FiSettings className="mr-1" />
              {showOptions ? 'Hide Options' : 'Show Options'}
            </button>
          </div>

          {!selectedImage ? (
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <FiUpload className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">Drag & drop your image here</p>
              <p className="text-gray-400 text-sm">or</p>
              <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                Browse Files
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
            </div>
          ) : (
            <div className="text-center">
              <div className="relative inline-block">
                <img 
                  src={previewUrl || ''} 
                  alt="Preview" 
                  className="max-h-64 max-w-full rounded-md shadow-sm"
                />
                <button 
                  onClick={() => {
                    setSelectedImage(null);
                    setPreviewUrl(null);
                    setConvertedUrl(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="mt-2 text-gray-600">{selectedImage.name}</p>
            </div>
          )}
        </div>

        {/* Options Section */}
        {showOptions && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Conversion Options</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Output Format</label>
                <select
                  name="format"
                  value={options.format}
                  onChange={handleOptionChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                >
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                  <option value="gif">GIF</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Quality ({options.quality}%)</label>
                <input
                  type="range"
                  name="quality"
                  min="10"
                  max="100"
                  value={options.quality}
                  onChange={handleOptionChange}
                  className="w-full"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="resize"
                    checked={options.resize}
                    onChange={handleOptionChange}
                    className="rounded text-blue-500 focus:ring-blue-200"
                  />
                  <span className="ml-2 text-gray-700">Resize Image</span>
                </label>
              </div>
              
              {options.resize && (
                <>
                  <div>
                    <label className="block text-gray-700 mb-2">Width (px)</label>
                    <input
                      type="number"
                      name="width"
                      value={options.width}
                      onChange={handleOptionChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Height (px)</label>
                    <input
                      type="number"
                      name="height"
                      value={options.height}
                      onChange={handleOptionChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Convert & Download Section */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleConvert}
              disabled={!selectedImage || isConverting}
              className={`flex-1 py-3 px-4 rounded-md flex items-center justify-center ${
                !selectedImage || isConverting
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } transition-colors`}
            >
              {isConverting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Converting...
                </>
              ) : (
                'Convert Image'
              )}
            </button>
            
            <button
              onClick={handleDownload}
              disabled={!convertedUrl}
              className={`flex-1 py-3 px-4 rounded-md flex items-center justify-center ${
                !convertedUrl
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } transition-colors`}
            >
              <FiDownload className="mr-2" />
              Download
            </button>
          </div>
        </div>

        {/* Result Preview */}
        {convertedUrl && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Converted Image</h2>
            <div className="text-center">
              <img 
                src={convertedUrl} 
                alt="Converted" 
                className="max-h-64 max-w-full rounded-md shadow-sm inline-block"
              />
              <p className="mt-2 text-gray-600">
                Format: {options.format.toUpperCase()} | 
                Quality: {options.quality}% | 
                {options.resize ? `Size: ${options.width}×${options.height}px` : 'Original Size'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>© 2023 Image Converter. All rights reserved.</p>
      </div>
    </div>
  );
};

export default ImageConverter;
