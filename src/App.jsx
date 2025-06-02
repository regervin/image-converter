import React, { useState, useRef } from 'react';
import { saveAs } from 'file-saver';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [targetFormat, setTargetFormat] = useState('jpeg');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const fileInputRef = useRef(null);

  const formatOptions = [
    { value: 'jpeg', label: 'JPEG (.jpg)' },
    { value: 'png', label: 'PNG (.png)' },
    { value: 'webp', label: 'WebP (.webp)' },
    { value: 'bmp', label: 'BMP (.bmp)' },
    { value: 'gif', label: 'GIF (.gif)' }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (!file) return;

    // Reset states
    setError('');
    setSuccess('');

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

  const convertImage = () => {
    if (!selectedFile) return;

    setError('');
    setSuccess('');

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
        canvas.toBlob((blob) => {
          if (!blob) {
            setError(`Failed to convert to ${targetFormat.toUpperCase()}`);
            return;
          }
          
          // Generate filename
          const originalName = selectedFile.name;
          const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
          const newFileName = `${baseName}.${targetFormat}`;
          
          // Save the file
          saveAs(blob, newFileName);
          
          setSuccess(`Image successfully converted to ${targetFormat.toUpperCase()}`);
        }, mimeType);
      } catch (err) {
        setError(`Error converting image: ${err.message}`);
      }
    };
    
    img.onerror = () => {
      setError('Error loading image');
    };
    
    img.src = previewUrl;
  };

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
                  onChange={(e) => setTargetFormat(e.target.value)}
                >
                  {formatOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                className="convert-button"
                onClick={convertImage}
                disabled={!selectedFile}
              >
                Convert Image
              </button>
              
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
