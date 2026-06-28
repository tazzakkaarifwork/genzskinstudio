import MarqueeText from '../models/MarqueeText.js';

// Get all marquee texts, sorted by order
export const getMarqueeTexts = async (req, res) => {
  try {
    const texts = await MarqueeText.find().sort({ order: 1 });
    res.json(texts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a marquee text
export const createMarqueeText = async (req, res) => {
  try {
    const { text, order } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const marqueeText = await MarqueeText.create({
      text,
      order: order !== undefined ? Number(order) : 0
    });

    res.status(201).json(marqueeText);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a marquee text
export const updateMarqueeText = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, order } = req.body;

    const marqueeText = await MarqueeText.findById(id);
    if (!marqueeText) {
      return res.status(404).json({ message: 'Marquee text not found' });
    }

    if (text !== undefined) marqueeText.text = text;
    if (order !== undefined) marqueeText.order = Number(order);

    const updated = await marqueeText.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a marquee text
export const deleteMarqueeText = async (req, res) => {
  try {
    const { id } = req.params;
    const marqueeText = await MarqueeText.findById(id);
    if (!marqueeText) {
      return res.status(404).json({ message: 'Marquee text not found' });
    }

    await marqueeText.deleteOne();
    res.json({ message: 'Marquee text removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk reorder marquee texts
export const reorderMarqueeTexts = async (req, res) => {
  try {
    const { orderings } = req.body; // Array of { id, order }
    if (!Array.isArray(orderings)) {
      return res.status(400).json({ message: 'Orderings array is required' });
    }

    const updates = orderings.map(item => 
      MarqueeText.findByIdAndUpdate(item.id, { order: Number(item.order) })
    );
    await Promise.all(updates);

    const texts = await MarqueeText.find().sort({ order: 1 });
    res.json(texts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
