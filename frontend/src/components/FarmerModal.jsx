import React, { useState, useEffect } from 'react';
import { X, Star, MapPin, Award, CheckCircle, ShieldCheck, MessageSquare, ShoppingBag, Calendar, Layers, Camera, Play, Film } from 'lucide-react';

export default function FarmerModal({ product, isOpen, onClose, onAddToCart }) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isVideoActive, setIsVideoActive] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedPhotoIndex(0);
      setIsVideoActive(false);
    }
  }, [product]);

  if (!isOpen || !product || !product.farmer) return null;

  const { farmer } = product;
  const productImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image || product.image_url].filter(Boolean);
  const hasVideo = Boolean(product.video_url || product.video);
  const currentPhoto = productImages[selectedPhotoIndex] || product.image || product.image_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-fade-in select-none">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 transform transition-all duration-300 flex flex-col max-h-[90vh]">
        
        {/* Modal Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-green-700 to-teal-800 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 rounded-full p-2 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-3.5">
            {/* Farmer Avatar / Photo */}
            <div className="relative shrink-0">
              <img
                src={farmer.avatar}
                alt={farmer.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-md"
              />
              {farmer.verified && (
                <div className="absolute bottom-0 right-0 bg-[#00ff33] text-gray-900 rounded-full p-1 shadow-xs" title="Verified Farmer">
                  <CheckCircle size={14} className="fill-current" />
                </div>
              )}
            </div>

            {/* Farmer Title & Badge */}
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight truncate">{farmer.name}</h2>
                <span className="bg-[#00ff33] text-gray-900 text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full italic uppercase shadow-2xs">
                  {farmer.badge || 'Verified Farmer'}
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-emerald-100 text-xs sm:text-sm flex-wrap">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin size={14} /> {farmer.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold text-yellow-300">
                  <Star size={15} className="fill-current text-yellow-400" />
                  {farmer.rating} / 5.0 ({farmer.ratingCount} Reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body Content (Scrollable) */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* ── INTERACTIVE MEDIA SHOWCASE (PHOTOS & MINI VIDEO) ── */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-gray-800 uppercase tracking-wider">
                <Camera size={15} className="text-emerald-700" />
                <span>Farm Gallery & Video</span>
              </div>
              <div className="flex items-center gap-2">
                {productImages.length > 1 && (
                  <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                    {productImages.length} Photos
                  </span>
                )}
                {hasVideo && (
                  <span className="text-[11px] font-bold text-white bg-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Film size={11} /> 1 Video
                  </span>
                )}
              </div>
            </div>

            {/* Main Stage Display (Photo or Video Player) */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video sm:h-64 w-full shadow-md border border-gray-200 flex items-center justify-center">
              {isVideoActive && hasVideo ? (
                <video
                  src={product.video_url || product.video}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={currentPhoto}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Media indicator pill */}
              <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                {isVideoActive ? (
                  <>
                    <Film size={12} className="text-[#00ff33]" />
                    <span>Demonstration Video</span>
                  </>
                ) : (
                  <>
                    <Camera size={12} className="text-[#00ff33]" />
                    <span>Photo {selectedPhotoIndex + 1} of {productImages.length}</span>
                  </>
                )}
              </div>
            </div>

            {/* Thumbnail Strip (Photos + Video Tab) */}
            {(productImages.length > 1 || hasVideo) && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedPhotoIndex(idx);
                      setIsVideoActive(false);
                    }}
                    className={`relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      !isVideoActive && selectedPhotoIndex === idx
                        ? 'border-emerald-600 ring-2 ring-emerald-400/40 scale-105 shadow-sm'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[#00ff33] text-[8px] font-bold text-center leading-none py-0.5">
                        Cover
                      </span>
                    )}
                  </button>
                ))}

                {/* Video Thumbnail Button */}
                {hasVideo && (
                  <button
                    type="button"
                    onClick={() => setIsVideoActive(true)}
                    className={`relative shrink-0 w-24 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-black flex flex-col items-center justify-center gap-0.5 text-white ${
                      isVideoActive
                        ? 'border-[#00ff33] ring-2 ring-[#00ff33]/40 scale-105 shadow-sm'
                        : 'border-gray-300 opacity-80 hover:opacity-100'
                    }`}
                    title="Play crop video"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                      <Play size={12} className="fill-current ml-0.5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tight text-[#00ff33]">
                      Play Video
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Grain Product Quick Spec */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h4 className="font-bold text-gray-900 text-base">{product.name}</h4>
              <p className="text-xs text-gray-600 mt-0.5">Variety: <span className="font-semibold text-emerald-900">{product.variety}</span></p>
              {product.harvestDate && (
                <p className="text-xs text-gray-500">Harvested: {product.harvestDate}</p>
              )}
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-emerald-800">₹{product.price} <span className="text-xs text-gray-500 font-normal">/ {product.unit}</span></div>
              <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                Direct Farm Rate
              </span>
            </div>
          </div>

          {/* Rating Breakdown Cards */}
          <div>
            <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-700" />
              <span>Farmer Rating & Trust Metrics</span>
            </h3>
            
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <div className="text-base font-black text-amber-600 flex items-center justify-center gap-1">
                  <Star size={14} className="fill-current text-amber-500" />
                  {farmer.qualityRating || '5.0'}
                </div>
                <div className="text-[10px] font-semibold text-gray-600 mt-0.5">Grain Quality</div>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <div className="text-base font-black text-blue-600 flex items-center justify-center gap-1">
                  <Star size={14} className="fill-current text-blue-500" />
                  {farmer.deliveryRating || '4.9'}
                </div>
                <div className="text-[10px] font-semibold text-gray-600 mt-0.5">Dispatch Time</div>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <div className="text-base font-black text-emerald-700 flex items-center justify-center gap-1">
                  <Star size={14} className="fill-current text-emerald-600" />
                  {farmer.purityTrust || '5.0'}
                </div>
                <div className="text-[10px] font-semibold text-gray-600 mt-0.5">Organic Purity</div>
              </div>
            </div>
          </div>

          {/* Farm Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                <Calendar size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-gray-500 font-medium">Experience</div>
                <div className="text-xs font-bold text-gray-800 truncate">{farmer.experience}</div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                <Layers size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-gray-500 font-medium">Farm Area</div>
                <div className="text-xs font-bold text-gray-800 truncate">{farmer.farmSize}</div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2.5 col-span-2 sm:col-span-1">
              <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
                <Award size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-gray-500 font-medium">Total Delivered</div>
                <div className="text-xs font-bold text-gray-800 truncate">{farmer.totalSales}</div>
              </div>
            </div>
          </div>

          {/* Farmer Bio / Practice Story */}
          {farmer.bio && (
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <h4 className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                About Farm & Cultivation Practice
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed italic">
                "{farmer.bio}"
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3 flex-wrap shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`Connecting with ${farmer.name}...`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-300 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-100 transition shadow-2xs cursor-pointer"
            >
              <MessageSquare size={14} className="text-emerald-700" />
              <span>Contact Farmer</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (onAddToCart) onAddToCart(product);
              onClose();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-md cursor-pointer active:scale-95"
          >
            <ShoppingBag size={15} />
            <span>Buy {product.name} @ ₹{product.price}/{product.unit}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
