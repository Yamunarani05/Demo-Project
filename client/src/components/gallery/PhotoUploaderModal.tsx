import React, { useState } from 'react';
import { Upload, X, Check, Image as ImageIcon, Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface PhotoUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (newPhotos: any[]) => void;
  shootId?: string;
}

const SAMPLE_FRAMES = [
  { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200', title: 'Ooty Tea Valley Golden Hour Hug', category: 'Portraits' },
  { url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200', title: 'Pine Forest Walking Hand-in-Hand', category: 'Highlights' },
  { url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200', title: 'Close-Up Emotional Forehead Kiss', category: 'Candid' },
  { url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=1200', title: 'Aerial Boat Drone Shot at Sunset', category: 'Drone' },
  { url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200', title: 'Lake Reflection Sunset Silhouette', category: 'Portraits' },
  { url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200', title: 'Spontaneous Laughing Stride', category: 'Candid' },
];

export const PhotoUploaderModal: React.FC<PhotoUploaderModalProps> = ({
  isOpen,
  onClose,
  onUploadComplete,
  shootId,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(154);
  const [uploadedThumbnails, setUploadedThumbnails] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const startSimulatedUpload = () => {
    setIsUploading(true);
    setProgress(0);
    setUploadedCount(0);
    setUploadedThumbnails([]);
    setIsSuccess(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setIsSuccess(true);
          onUploadComplete(SAMPLE_FRAMES);
          return 100;
        }

        const nextProgress = prev + 8;
        const currentCount = Math.round((nextProgress / 100) * totalCount);
        setUploadedCount(currentCount);

        // Add sample thumbnails gradually
        if (nextProgress > 20 && uploadedThumbnails.length < 2) {
          setUploadedThumbnails((t) => [...t, SAMPLE_FRAMES[0].url, SAMPLE_FRAMES[1].url]);
        } else if (nextProgress > 50 && uploadedThumbnails.length < 4) {
          setUploadedThumbnails((t) => [...t, SAMPLE_FRAMES[2].url, SAMPLE_FRAMES[3].url]);
        } else if (nextProgress > 80 && uploadedThumbnails.length < 6) {
          setUploadedThumbnails((t) => [...t, SAMPLE_FRAMES[4].url, SAMPLE_FRAMES[5].url]);
        }

        return nextProgress;
      });
    }, 180);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center max-w-md mx-auto space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5E35B1] border border-purple-200 flex items-center justify-center mx-auto shadow-sm">
            <Upload className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Upload Photography Session Files
          </h2>
          <p className="text-xs text-slate-500">
            RAW & High-Res JPEG tethering import engine. Supports multi-gigabyte uploads with automatic color-profile preservation.
          </p>
        </div>

        {/* Dropzone Area */}
        {!isUploading && !isSuccess ? (
          <div
            onClick={startSimulatedUpload}
            className="border-2 border-dashed border-purple-200 hover:border-[#5E35B1] bg-purple-50/30 hover:bg-purple-50/60 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3 group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 text-[#5E35B1] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Click to Drop Session Folder or Select Files
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Sony ARW, Canon CR3, Nikon NEF, or Full-Res JPEG
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-[#5E35B1] hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all inline-flex items-center gap-2"
            >
              <span>Simulate 154 RAW Photos Upload</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : isUploading ? (
          /* Live Uploading Progress View */
          <div className="space-y-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#5E35B1] animate-spin" />
                Uploading & Generating Previews...
              </span>
              <span className="font-black text-[#5E35B1] text-sm">{progress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5E35B1] to-indigo-500 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-500 text-center font-medium">
              Imported <strong>{uploadedCount}</strong> of {totalCount} RAW files into cloud gallery
            </p>

            {/* Flying Thumbnail Previews */}
            <div className="grid grid-cols-6 gap-2 pt-2">
              {uploadedThumbnails.map((thumb, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl overflow-hidden bg-slate-200 border border-slate-300 animate-in zoom-in-75 duration-300 shadow-sm"
                >
                  <img src={thumb} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto font-black shadow-sm animate-in zoom-in-50">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              ✓ 154 Photos Uploaded Successfully
            </h3>
            <p className="text-xs text-slate-600">
              High-resolution proxies generated. The gallery is now live and ready for curation or client review.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
              >
                View Live Gallery
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUploaderModal;
