import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  CheckCircle2,
  MessageSquare,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  Send,
  Sparkles,
} from 'lucide-react';

interface FullscreenViewerProps {
  photos: any[];
  initialPhotoId: string;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (photoId: string) => void;
  onToggleSelect: (photoId: string) => void;
  onAddComment: (photoId: string, text: string) => Promise<void>;
  currentUserRole?: string;
  currentUserName?: string;
}

export const FullscreenViewer: React.FC<FullscreenViewerProps> = ({
  photos,
  initialPhotoId,
  isOpen,
  onClose,
  onToggleFavorite,
  onToggleSelect,
  onAddComment,
  currentUserRole = 'client',
  currentUserName = 'Client',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const idx = photos.findIndex((p) => p.id === initialPhotoId);
    if (idx !== -1) setCurrentIndex(idx);
    setZoomLevel(1);
  }, [initialPhotoId, photos]);

  const currentPhoto = photos[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'f') onToggleFavorite(currentPhoto?.id);
      else if (e.key === 's') onToggleSelect(currentPhoto?.id);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, currentPhoto]);

  if (!isOpen || !currentPhoto) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setZoomLevel(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setZoomLevel(1);
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await onAddComment(currentPhoto.id, commentText.trim());
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200">
      {/* Top Controls Bar */}
      <div className="p-4 px-6 flex items-center justify-between text-white z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold tracking-wider text-slate-300">
            {currentIndex + 1} <span className="text-slate-500">/</span> {photos.length}
          </span>
          <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
            {currentPhoto.category}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom controls */}
          <button
            onClick={() => setZoomLevel((z) => (z === 1 ? 1.5 : 1))}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Toggle Zoom"
          >
            {zoomLevel === 1 ? <ZoomIn className="w-5 h-5" /> : <ZoomOut className="w-5 h-5" />}
          </button>

          {/* Comments panel toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              showComments
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900'
                : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{currentPhoto.commentsCount || currentPhoto.comments?.length || 0}</span>
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Center Stage & Next/Prev Controls */}
      <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
        {/* Prev Arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-6 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Main Photo View */}
        <div
          className="relative max-h-full max-w-full flex items-center justify-center transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <img
            src={currentPhoto.url}
            alt={currentPhoto.title}
            className="max-h-[80vh] max-w-[85vw] object-contain rounded-2xl shadow-2xl transition-all"
          />
        </div>

        {/* Next Arrow */}
        <button
          onClick={handleNext}
          className="absolute right-6 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide-over Comments Panel */}
        {showComments && (
          <div className="absolute right-6 top-6 bottom-6 w-80 bg-slate-900/95 border border-slate-700 rounded-3xl p-5 shadow-2xl backdrop-blur-xl z-30 flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  Notes & Retouching
                </h3>
                <button
                  onClick={() => setShowComments(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 overflow-y-auto max-h-[50vh] pr-1 text-xs">
                {currentPhoto.comments?.length > 0 ? (
                  currentPhoto.comments.map((c: any) => (
                    <div key={c.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-purple-300">{c.authorName}</span>
                        <span className="text-[10px] text-slate-500">{c.authorRole}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed">{c.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-xs italic py-4 text-center">
                    No notes for this photo yet. Add instructions for the editing team below.
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleSendComment} className="pt-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Leave editing note..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={submittingComment}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="p-4 px-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white drop-shadow-md">
            {currentPhoto.title}
          </h2>
          <p className="text-xs text-slate-400">
            {currentPhoto.category} &bull; Status: <span className="text-emerald-400 font-semibold">{currentPhoto.editStatus || 'Original Capture'}</span>
          </p>
        </div>

        {/* Favorite & Album Selection Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleFavorite(currentPhoto.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              currentPhoto.isFavorite
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <Heart className={`w-4 h-4 ${currentPhoto.isFavorite ? 'fill-white' : ''}`} />
            <span>{currentPhoto.isFavorite ? 'Favorited' : 'Favorite (F)'}</span>
          </button>

          <button
            onClick={() => onToggleSelect(currentPhoto.id)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              currentPhoto.isSelected
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{currentPhoto.isSelected ? '✓ Selected for Album' : 'Select for Album (S)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullscreenViewer;
