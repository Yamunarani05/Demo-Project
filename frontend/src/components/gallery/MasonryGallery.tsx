import React, { useState } from 'react';
import { Heart, CheckCircle2, MessageSquare, Maximize2, Sparkles, Filter } from 'lucide-react';

interface PhotoItem {
  id: string;
  url: string;
  thumbnail?: string;
  title: string;
  category: string;
  isFavorite?: boolean;
  isSelected?: boolean;
  isEdited?: boolean;
  editStatus?: string;
  commentsCount?: number;
  comments?: any[];
}

interface MasonryGalleryProps {
  photos: PhotoItem[];
  onSelectPhoto: (photo: PhotoItem) => void;
  onToggleFavorite: (photoId: string, e: React.MouseEvent) => void;
  onToggleSelect: (photoId: string, e: React.MouseEvent) => void;
  onOpenComment: (photo: PhotoItem, e: React.MouseEvent) => void;
  readOnly?: boolean;
}

export const MasonryGallery: React.FC<MasonryGalleryProps> = ({
  photos,
  onSelectPhoto,
  onToggleFavorite,
  onToggleSelect,
  onOpenComment,
  readOnly = false,
}) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const categories = ['all', 'Portraits', 'Candid', 'Highlights', 'Drone', 'Decor'];

  const filteredPhotos = activeCategory === 'all'
    ? photos
    : photos.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Category Pills Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold capitalize transition-all ${
                activeCategory === cat
                  ? 'bg-[#5E35B1] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-purple-300'
              }`}
            >
              {cat === 'all' ? 'All Frames' : cat}
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Showing <strong>{filteredPhotos.length}</strong> of {photos.length} photos
        </span>
      </div>

      {/* Dynamic Masonry Columns Layout */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {filteredPhotos.map((photo, idx) => (
          <div
            key={photo.id}
            onClick={() => onSelectPhoto(photo)}
            className="group relative break-inside-avoid rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 hover:border-purple-300 transition-all duration-300 shadow-sm hover:shadow-xl cursor-pointer"
          >
            {/* Image */}
            <img
              src={photo.url}
              alt={photo.title}
              loading="lazy"
              className="w-full object-cover group-hover:scale-105 transition-transform duration-700 rounded-3xl"
            />

            {/* Gradient Vignette on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl flex flex-col justify-between p-4" />

            {/* Top Overlay Badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
              <div className="flex items-center gap-1.5">
                {photo.isSelected && (
                  <span className="px-2.5 py-1 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center gap-1 shadow-md animate-in zoom-in-50 duration-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Selected
                  </span>
                )}
                {photo.isFavorite && (
                  <span className="p-1.5 rounded-full bg-rose-600 text-white text-[10px] shadow-md animate-in zoom-in-50 duration-200">
                    <Heart className="w-3.5 h-3.5 fill-white" />
                  </span>
                )}
              </div>

              {!readOnly && (
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {/* Favorite button */}
                  <button
                    onClick={(e) => onToggleFavorite(photo.id, e)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      photo.isFavorite
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-white/90 text-slate-700 hover:bg-rose-600 hover:text-white shadow-sm'
                    }`}
                    title={photo.isFavorite ? 'Remove from favorites' : 'Heart favorite'}
                  >
                    <Heart className={`w-4 h-4 ${photo.isFavorite ? 'fill-white' : ''}`} />
                  </button>

                  {/* Select button */}
                  <button
                    onClick={(e) => onToggleSelect(photo.id, e)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      photo.isSelected
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white/90 text-slate-700 hover:bg-purple-600 hover:text-white shadow-sm'
                    }`}
                    title={photo.isSelected ? 'Unselect' : 'Select for album'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Caption Overlay */}
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end justify-between">
              <div>
                <span className="text-xs font-bold text-white block drop-shadow-md truncate max-w-[180px]">
                  {photo.title}
                </span>
                <span className="text-[10px] font-semibold text-purple-200 uppercase tracking-wider">
                  {photo.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => onOpenComment(photo, e)}
                  className="px-2 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 hover:bg-white/40"
                  title="View Comments"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>{photo.commentsCount || 0}</span>
                </button>

                <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MasonryGallery;
