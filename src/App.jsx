import React, { useState, useRef, useEffect } from 'react';
import { saveAs } from 'file-saver';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [targetFormat, setTargetFormat] = useState('jpeg');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const [quality, setQuality] = useState(90);
  const [estimatedSize, setEstimatedSize] = useState(null);
  const [convertedBlob, setConvertedBlob] = useState(null);
  const [convertedFileName, setConvertedFileName] = useState('');
  const fileInputRef = useRef(null);

  const formatOptions = [
    { value: 'jpeg', label: 'JPEG (.jpg)' },
    { value: 'png', label: 'PNG (.png)' },
    { value: 'webp', label: 'WebP (.webp)' },
    { value: 'bmp', label: 'BMP (.bmp)' },
    { value: 'gif', label: 'GIF (.gif)' }
  ];

  // Update estimated size when quality or selected file changes
  useEffect(() => {
    if (selectedFile && ['jpeg', 'webp'].includes(targetFormat)) {
      estimateFileSize();
    }
  }, [quality, selectedFile, targetFormat]);

  const estimateFileSize = () => {
    if (!selectedFile) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Only JPEG and WebP support quality settings
      if (['jpeg', 'webp'].includes(targetFormat)) {
        canvas.toBlob((blob) => {
          if (blob) {
            // Estimate size based on quality
            // This is a rough estimate: original size * (quality/100)
            const estimatedBytes = blob.size * (quality / 100);
            setEstimatedSize(formatFileSize(estimatedBytes));
          }
        }, `image/${targetFormat}`, quality / 100);
      } else {
        canvas.toBlob((blob) => {
          if (blob) {
            setEstimatedSize(formatFileSize(blob.size));
          }
        }, `image/${targetFormat}`);
      }
    };
    
    img.src = previewUrl;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (!file) return;

    // Reset states
    setError('');
    setSuccess('');
    setConvertedBlob(null);
    setConvertedFileName('');

    // Check if file is an image
    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Set file info
    setFileInfo({
      name: file.name,
      type: file.type,
      size: formatFileSize(file.size)
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFormatChange = (e) => {
    const newFormat = e.target.value;
    setTargetFormat(newFormat);
    
    // Reset quality to default for formats that don't support quality
    if (!['jpeg', 'webp'].includes(newFormat)) {
      setQuality(90);
      setEstimatedSize(null);
    }
    
    // Clear converted blob when format changes
    setConvertedBlob(null);
    setConvertedFileName('');
    setSuccess('');
  };

  const convertImage = () => {
    if (!selectedFile) return;

    setError('');
    setSuccess('');
    setConvertedBlob(null);
    setConvertedFileName('');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0);
      
      try {
        // Convert canvas to desired format
        const mimeType = `image/${targetFormat}`;
        
        // Apply quality setting for formats that support it
        const qualityOption = ['jpeg', 'webp'].includes(targetFormat) ? quality / 100 : undefined;
        
        canvas.toBlob((blob) => {
          if (!blob) {
            setError(`Failed to convert to ${targetFormat.toUpperCase()}`);
            return;
          }
          
          // Generate filename
          const originalName = selectedFile.name;
          const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
          const newFileName = `${baseName}.${targetFormat}`;
          
          // Store the blob and filename for later download
          setConvertedBlob(blob);
          setConvertedFileName(newFileName);
          
          setSuccess(`Image successfully converted to ${targetFormat.toUpperCase()} (${formatFileSize(blob.size)})`);
        }, mimeType, qualityOption);
      } catch (err) {
        setError(`Error converting image: ${err.message}`);
      }
    };
    
    img.onerror = () => {
      setError('Error loading image');
    };
    
    img.src = previewUrl;
  };

  const downloadImage = () => {
    if (convertedBlob && convertedFileName) {
      saveAs(convertedBlob, convertedFileName);
    }
  };

  // Determine if quality slider should be shown
  const showQualitySlider = selectedFile && ['jpeg', 'webp'].includes(targetFormat);

  return (
    <div className="container">
      <header className="app-header">
        <h1 className="app-title">Image Converter</h1>
        <p className="app-description">Upload an image and convert it to your desired format</p>
      </header>
      
      <main>
        <div className="converter-card">
          <div 
            className={`upload-container ${isDragging ? 'active' : ''}`}
            onClick={handleUploadClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="upload-icon">📁</div>
            <p className="upload-text">
              {selectedFile ? selectedFile.name : 'Click or drag & drop to upload an image'}
            </p>
            <p className="upload-subtext">
              Supports JPG, PNG, WebP, BMP, and GIF
            </p>
            <input 
              type="file" 
              className="file-input" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>
          
          {selectedFile && (
            <>
              <div className="format-selection">
                <label htmlFor="format-select" className="format-label">
                  Convert to:
                </label>
                <select 
                  id="format-select" 
                  className="format-select"
                  value={targetFormat}
                  onChange={handleFormatChange}
                >
                  {formatOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {showQualitySlider && (
                <div className="quality-control">
                  <label htmlFor="quality-slider" className="quality-label">
                    Quality: {quality}%
                  </label>
                  <input
                    id="quality-slider"
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="quality-slider"
                  />
                  {estimatedSize && (
                    <div className="estimated-size">
                      Estimated size: {estimatedSize}
                    </div>
                  )}
                </div>
              )}
              
              <div className="button-group">
                <button 
                  className="convert-button"
                  onClick={convertImage}
                  disabled={!selectedFile}
                >
                  Convert Image
                </button>
                
                {convertedBlob && (
                  <button 
                    className="download-button"
                    onClick={downloadImage}
                  >
                    Download Converted Image
                  </button>
                )}
              </div>
              
              <div className="preview-container">
                <h3 className="preview-title">Image Preview</h3>
                <img src={previewUrl} alt="Preview" className="image-preview" />
                
                {fileInfo && (
                  <div className="file-info">
                    <div className="file-info-item">
                      <span className="file-info-label">Name:</span>
                      <span>{fileInfo.name}</span>
                    </div>
                    <div className="file-info-item">
                      <span className="file-info-label">Type:</span>
                      <span>{fileInfo.type}</span>
                    </div>
                    <div className="file-info-item">
                      <span className="file-info-label">Size:</span>
                      <span>{fileInfo.size}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>
      </main>
    </div>
  );
}

export default App;
