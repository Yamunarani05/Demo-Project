import { Router, Request, Response } from 'express';
import { memoryStore } from '../db';

const router = Router();

// GET /api/search?q=...&studioId=...
router.get('/', (req: Request, res: Response) => {
  try {
    const q = ((req.query.q as string) || '').trim().toLowerCase();
    const studioId = req.query.studioId as string;

    if (!q) {
      return res.json({
        success: true,
        data: {
          studios: [],
          clients: [],
          shoots: [],
          photographers: [],
          deliverables: [],
        },
      });
    }

    // Filter studios
    const studios = memoryStore.studios
      .filter((s) => s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.tagline.toLowerCase().includes(q))
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        type: 'studio',
        title: s.name,
        subtitle: `${s.city}, ${s.state} • ${s.plan}`,
        image: s.logo,
        coverImage: s.coverImage,
        url: `/master/studios/${s.id}`,
        meta: `${s.activeShootsCount || 0} active shoots`,
      }));

    // Filter clients
    let clientSource = memoryStore.clients;
    if (studioId && studioId !== 'all') {
      clientSource = clientSource.filter((c) => c.studioId === studioId);
    }
    const clients = clientSource
      .filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.coupleName.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((c) => {
        const studio = memoryStore.studios.find((s) => s.id === c.studioId);
        return {
          id: c.id,
          type: 'client',
          title: c.coupleName || c.name,
          subtitle: `${c.name} • ${c.location}`,
          image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=150',
          url: c.activeShootId ? `/studio/shoots/${c.activeShootId}` : `/studio/clients`,
          studioName: studio?.name,
          meta: c.package,
        };
      });

    // Filter shoots
    let shootSource = memoryStore.shoots;
    if (studioId && studioId !== 'all') {
      shootSource = shootSource.filter((s) => s.studioId === studioId);
    }
    const shoots = shootSource
      .filter((s) =>
        s.title.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q) ||
        (s.photographerName && s.photographerName.toLowerCase().includes(q))
      )
      .slice(0, 6)
      .map((s) => {
        const studio = memoryStore.studios.find((st) => st.id === s.studioId);
        return {
          id: s.id,
          type: 'shoot',
          title: s.title,
          subtitle: `${s.type} • ${s.location} • ${s.shootDate}`,
          image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=150',
          url: `/studio/shoots/${s.id}`,
          studioName: studio?.name,
          status: s.status,
          progress: s.progressPercent,
        };
      });

    // Filter photographers
    let photoSource = memoryStore.photographers;
    if (studioId && studioId !== 'all') {
      photoSource = photoSource.filter((p) => p.studioId === studioId);
    }
    const photographers = photoSource
      .filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.specialization.some((sp) => sp.toLowerCase().includes(q)) ||
        (p.equipment && p.equipment.toLowerCase().includes(q))
      )
      .slice(0, 5)
      .map((p) => {
        const studio = memoryStore.studios.find((s) => s.id === p.studioId);
        return {
          id: p.id,
          type: 'photographer',
          title: p.name,
          subtitle: `${p.experience} • ${p.specialization.join(', ')}`,
          image: p.profileImage,
          url: `/studio/photographers`,
          studioName: studio?.name,
          rating: p.rating,
          status: p.availabilityStatus,
        };
      });

    // Filter deliverables
    let delivSource = memoryStore.deliverables;
    if (studioId && studioId !== 'all') {
      delivSource = delivSource.filter((d) => d.studioId === studioId);
    }
    const deliverables = delivSource
      .filter((d) => d.title.toLowerCase().includes(q) || d.type.toLowerCase().includes(q))
      .slice(0, 4)
      .map((d) => ({
        id: d.id,
        type: 'deliverable',
        title: d.title,
        subtitle: `${d.fileSize} • ${d.type.replace(/_/g, ' ')}`,
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        url: `/studio/deliverables`,
        downloadUrl: d.downloadUrl,
      }));

    res.json({
      success: true,
      query: q,
      totalCount: studios.length + clients.length + shoots.length + photographers.length + deliverables.length,
      data: {
        studios,
        clients,
        shoots,
        photographers,
        deliverables,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Search failed', message: err.message });
  }
});

export default router;
