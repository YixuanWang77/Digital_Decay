import { useState } from 'react';
import { CoverFlowCarousel } from './components/CoverFlowCarousel';

const photos = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1607699265032-3eafa2806ae6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmUlMjBtaW5pbWFsJTIwYmxhY2slMjB3aGl0ZXxlbnwxfHx8fDE3NzA1OTkzOTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    fileName: 'ARCH_001.jpg',
    orientation: 'portrait' as const,
    isUploaded: false
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1595411425732-e69c1abe2763?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMHBhdHRlcm58ZW58MXx8fHwxNzcwNTEwOTM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    fileName: 'GEOMETRIC_002.jpg',
    orientation: 'portrait' as const,
    isUploaded: false
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1673460244101-f80f7d9d9d9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwbGFuZHNjYXBlJTIwbW9ub2Nocm9tZXxlbnwxfHx8fDE3NzA1OTkzOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    fileName: 'LANDSCAPE_003.jpg',
    orientation: 'portrait' as const,
    isUploaded: false
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1769283979195-d418a41ae2ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicnV0YWxpc3QlMjBidWlsZGluZyUyMGNvbmNyZXRlfGVufDF8fHx8MTc3MDU5OTM5Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    fileName: 'BRUTALIST_004.jpg',
    orientation: 'portrait' as const,
    isUploaded: false
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwaW50ZXJpb3IlMjBkZXNpZ258ZW58MXx8fHwxNzcwNTk4NzYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    fileName: 'INTERIOR_005.jpg',
    orientation: 'portrait' as const,
    isUploaded: false
  }
];

function App() {
  const [uploadedPhotos, setUploadedPhotos] = useState(photos);

  const handleUpload = (file: File) => {
    // Create a URL for the uploaded file
    const fileUrl = URL.createObjectURL(file);
    
    // Create an image element to detect orientation
    const img = new Image();
    img.onload = () => {
      const orientation = img.width > img.height ? 'landscape' : 'portrait';
      
      const newPhoto = {
        id: uploadedPhotos.length + 1,
        url: fileUrl,
        fileName: file.name.toUpperCase(),
        orientation: orientation as 'landscape' | 'portrait',
        isUploaded: true
      };
      
      setUploadedPhotos([...uploadedPhotos, newPhoto]);
    };
    img.src = fileUrl;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center">
        <CoverFlowCarousel photos={uploadedPhotos} onUpload={handleUpload} />
      </main>
    </div>
  );
}

export default App;