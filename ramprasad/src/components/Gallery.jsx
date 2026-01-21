import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Maximize2, Filter } from 'lucide-react';
import '../Style/gallery.css';
import ram1 from '../image/ram1.png';
import ram2 from '../image/ram2.png';
import ram3 from '../image/ram3.png';
import ram4 from '../image/ram4.png';
import ram5 from '../image/ram5.jpeg';
import ram6 from '../image/ram6.png';
import ram7 from '../image/ram7.png';
import ram8 from '../image/ram8.png';
import ram9 from '../image/ram9.png';
import ram10 from '../image/ram10.png';
import ram11 from '../image/ram11.png';
import ram12 from '../image/ram12.png';

const Gallery = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  // Sample Data - Replace with your actual image URLs
  const photos = [
  { id: 1, category: 'travel', title: 'Photo 1', url: ram1 },
  { id: 2, category: 'tech', title: 'Photo 2', url: ram2 },
  { id: 3, category: 'nature', title: 'Photo 3', url: ram3 },
  { id: 4, category: 'travel', title: 'Photo 4', url: ram4 },
  { id: 5, category: 'tech', title: 'Photo 5', url: ram5 },
  { id: 6, category: 'nature', title: 'Photo 6', url: ram6 },
  { id: 7, category: 'travel', title: 'Photo 7', url: ram7 },
  { id: 8, category: 'tech', title: 'Photo 8', url: ram8 },
  { id: 9, category: 'nature', title: 'Photo 9', url: ram9 },
  { id: 10, category: 'travel', title: 'Photo 10', url: ram10 },
  { id: 11, category: 'tech', title: 'Photo 11', url: ram11 },
  { id: 12, category: 'nature', title: 'Photo 12', url: ram12 },
];


  const categories = ['all', 'nature', 'tech', 'travel'];

  const filteredPhotos = filter === 'all' 
    ? photos 
    : photos.filter(p => p.category === filter);

  return (
    <div className="gallery-page">
      <div className="gallery-container">
        
        {/* Header & Navigation */}
        <header className="gallery-header">
          <button onClick={() => navigate('/')} className="neo-back-link">
            <ArrowLeft size={16} /> <span>Home</span>
          </button>
          <div className="gallery-title-group">
            <h1 className="gallery-title">Visual Gallery</h1>
            <p className="gallery-subtitle">A collection of moments and work captures.</p>
          </div>
        </header>

        {/* Category Filter Tabs */}
        <div className="filter-bar">
          <div className="filter-label">
            <Filter size={14} /> <span>Filter by</span>
          </div>
          <div className="filter-tabs">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`filter-tab ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Photo Grid */}
        <div className="photo-grid">
          {filteredPhotos.map(photo => (
            <div key={photo.id} className="photo-card">
              <div className="photo-wrapper">
                <img src={photo.url} alt={photo.title} loading="lazy" />
                <div className="photo-overlay">
                  <span className="photo-category">{photo.category}</span>
                  <h3 className="photo-name">{photo.title}</h3>
                  <button className="expand-btn"><Maximize2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Gallery;