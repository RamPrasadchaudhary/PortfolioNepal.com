import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Maximize2, Filter } from 'lucide-react';
import '../Style/gallery.css';

const Gallery = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  // Sample Data - Replace with your actual image URLs
  const photos = [
    { id: 1, category: 'travel', title: 'Kathmandu Streets', url: 'https://images.unsplash.com/photo-1544161513-0179fe746fd5?q=80&w=600' },
    { id: 2, category: 'tech', title: 'My Workspace', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600' },
    { id: 3, category: 'nature', title: 'Himalayan Peak', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600' },
    { id: 4, category: 'travel', title: 'Pokhara Lake', url: 'https://images.unsplash.com/photo-1617469165786-8007eda3caa7?q=80&w=600' },
    { id: 5, category: 'tech', title: 'Code Focus', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600' },
    { id: 6, category: 'nature', title: 'Forest Trail', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600' },
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