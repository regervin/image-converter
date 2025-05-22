import React from 'react';
import ImageConverter from './components/ImageConverter';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <ImageConverter />
      </div>
    </div>
  );
};

export default App;
