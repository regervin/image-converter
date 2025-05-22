import React, { useState, useRef } from 'react';
import { FiUpload, FiDownload } from 'react-icons/fi';

interface ConversionFormat {
  label: string;
  value: string;
}

const SUPPORTED_FORMATS: ConversionFormat[] = [
  { label: 'PNG', value: 'png' },
  { label: 'JPEG', value: 'jpeg' },
  { label: 'WebP', value: 'webp' },
];

const ImageConverter: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('png');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConvert = async () => {
    if (!selectedImage) return;

    const image = new Image();
    image.src = selectedImage;
    
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(image, 0, 0);
      
      const convertedImage = canvas.toDataURL(`image/${targetFormat}`);
      const link = document.createElement('a');
      link.download = `converted-image.${targetFormat}`;
      link.href = convertedImage;
      link.click();
    };
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Image Converter</h2>
          <p className="text-gray-600 mt-2">Convert your images to different formats</p>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          {selectedImage ? (
            <div className="space-y-4">
              <img 
                src={selectedImage} 
                alt="Selected" 
                className="max-h-64 mx-auto"
              />
              <button
                onClick={() => setSelectedImage(null)}
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
          </div>

          <button
            onClick={handleConvert}
            disabled={!selectedImage}
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
