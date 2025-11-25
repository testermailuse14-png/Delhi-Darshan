import express from 'express';
import { z } from 'zod';
import prisma from '../utils/db.js';
import { authenticateToken } from '../utils/auth.js';

const router = express.Router();

const hiddenGemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  image: z.string().optional(),
});

// Get all hidden gems
router.get('/', async (req, res) => {
  try {
    const gems = await prisma.hiddenGem.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ gems });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single hidden gem
router.get('/:id', async (req, res) => {
  try {
    const gem = await prisma.hiddenGem.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!gem) {
      return res.status(404).json({ error: 'Hidden gem not found' });
    }

    res.json({ gem });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create hidden gem (authentication required)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const data = hiddenGemSchema.parse(req.body);

    const gem = await prisma.hiddenGem.create({
      data: {
        ...data,
        userId: req.userId,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Hidden gem created successfully',
      gem,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update hidden gem (only by owner)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const gem = await prisma.hiddenGem.findUnique({
      where: { id: req.params.id },
    });

    if (!gem) {
      return res.status(404).json({ error: 'Hidden gem not found' });
    }

    if (gem.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const data = hiddenGemSchema.partial().parse(req.body);

    const updatedGem = await prisma.hiddenGem.update({
      where: { id: req.params.id },
      data,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Hidden gem updated successfully',
      gem: updatedGem,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete hidden gem (only by owner)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const gem = await prisma.hiddenGem.findUnique({
      where: { id: req.params.id },
    });

    if (!gem) {
      return res.status(404).json({ error: 'Hidden gem not found' });
    }

    if (gem.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.hiddenGem.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: 'Hidden gem deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
