import { Router, Request, Response } from 'express';
import { memoryStore, GalleryPhotoRecord, PhotoCommentRecord } from '../db';

const router = Router();

// GET /api/galleries/shoot/:shootId - Get all photos & comments for a shoot
router.get('/shoot/:shootId', (req: Request, res: Response) => {
  const { shootId } = req.params;
  const { category, filter } = req.query; // filter: 'all' | 'favorites' | 'selected' | 'edited'

  let photos = memoryStore.photos.filter(p => p.shootId === shootId);

  if (category && category !== 'all') {
    photos = photos.filter(p => p.category === category);
  }

  if (filter === 'favorites') {
    photos = photos.filter(p => p.isFavorite);
  } else if (filter === 'selected') {
    photos = photos.filter(p => p.isSelected);
  } else if (filter === 'edited') {
    photos = photos.filter(p => p.isEdited);
  }

  // Attach comments to each photo
  const photosWithComments = photos.map(photo => {
    const comments = memoryStore.photoComments.filter(c => c.photoId === photo.id);
    return {
      ...photo,
      comments,
      commentsCount: comments.length,
    };
  });

  const shoot = memoryStore.shoots.find(s => s.id === shootId);

  res.json({
    success: true,
    shoot,
    data: photosWithComments,
    summary: {
      total: memoryStore.photos.filter(p => p.shootId === shootId).length,
      favorites: memoryStore.photos.filter(p => p.shootId === shootId && p.isFavorite).length,
      selected: memoryStore.photos.filter(p => p.shootId === shootId && p.isSelected).length,
      edited: memoryStore.photos.filter(p => p.shootId === shootId && p.isEdited).length,
    },
  });
});

// POST /api/galleries/photos - Upload new photo to gallery
router.post('/photos', (req: Request, res: Response) => {
  const { shootId, studioId, url, thumbnail, title, category } = req.body;

  if (!shootId || !url) {
    return res.status(400).json({ success: false, message: 'shootId and url are required' });
  }

  const shoot = memoryStore.shoots.find(s => s.id === shootId);

  const newPhoto: GalleryPhotoRecord = {
    id: `photo_item_${Date.now()}`,
    shootId,
    galleryId: `gal_${shootId}`,
    studioId: studioId || shoot?.studioId || 'studio_1',
    url,
    thumbnail: thumbnail || url,
    title: title || 'Curated Capture',
    category: category || 'Portraits',
    isFavorite: false,
    isSelected: false,
    isEdited: false,
    editStatus: 'raw',
    commentsCount: 0,
    created_at: new Date().toISOString(),
  };

  memoryStore.photos.push(newPhoto);

  if (shoot) {
    shoot.photoCount = memoryStore.photos.filter(p => p.shootId === shootId).length;
  }

  res.status(201).json({
    success: true,
    data: newPhoto,
    message: 'Photo added to gallery',
  });
});

// PUT /api/galleries/photos/:id/favorite - Toggle favorite (Heart)
router.put('/photos/:id/favorite', (req: Request, res: Response) => {
  const { id } = req.params;
  const photo = memoryStore.photos.find(p => p.id === id);

  if (!photo) {
    return res.status(404).json({ success: false, message: 'Photo not found' });
  }

  photo.isFavorite = !photo.isFavorite;

  res.json({
    success: true,
    isFavorite: photo.isFavorite,
    message: photo.isFavorite ? 'Photo added to favorites' : 'Removed from favorites',
  });
});

// PUT /api/galleries/photos/:id/select - Toggle Client Selection
router.put('/photos/:id/select', (req: Request, res: Response) => {
  const { id } = req.params;
  const photo = memoryStore.photos.find(p => p.id === id);

  if (!photo) {
    return res.status(404).json({ success: false, message: 'Photo not found' });
  }

  photo.isSelected = !photo.isSelected;

  // Update shoot selected photo counter
  const shoot = memoryStore.shoots.find(s => s.id === photo.shootId);
  if (shoot) {
    shoot.selectedPhotoCount = memoryStore.photos.filter(p => p.shootId === shoot.id && p.isSelected).length;
  }

  res.json({
    success: true,
    isSelected: photo.isSelected,
    selectedCount: shoot?.selectedPhotoCount || 0,
    message: photo.isSelected ? 'Photo selected for album editing' : 'Photo unselected',
  });
});

// POST /api/galleries/photos/:id/comments - Add Comment to Photo
router.post('/photos/:id/comments', (req: Request, res: Response) => {
  const { id } = req.params;
  const { authorName, authorRole, text } = req.body;

  const photo = memoryStore.photos.find(p => p.id === id);
  if (!photo) {
    return res.status(404).json({ success: false, message: 'Photo not found' });
  }

  if (!text) {
    return res.status(400).json({ success: false, message: 'Comment text is required' });
  }

  const newComment: PhotoCommentRecord = {
    id: `comm_${Date.now()}`,
    photoId: id,
    shootId: photo.shootId,
    authorName: authorName || 'Client',
    authorRole: authorRole || 'client',
    text,
    timestamp: new Date().toISOString(),
  };

  memoryStore.photoComments.push(newComment);
  photo.commentsCount = memoryStore.photoComments.filter(c => c.photoId === id).length;

  res.status(201).json({
    success: true,
    data: newComment,
    message: 'Comment added to photo',
  });
});

export default router;
