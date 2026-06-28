import ReturnPolicy from '../models/ReturnPolicy.js';

export const getReturnPolicies = async (req, res) => {
  try {
    const policies = await ReturnPolicy.find().sort({ createdAt: 1 });
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReturnPolicy = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const policy = await ReturnPolicy.create({ title, description });
    res.status(201).json(policy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReturnPolicy = async (req, res) => {
  try {
    const policy = await ReturnPolicy.findById(req.params.id);
    if (!policy) return res.status(404).json({ message: 'Return policy not found' });

    policy.title = req.body.title ?? policy.title;
    policy.description = req.body.description ?? policy.description;
    const updated = await policy.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReturnPolicy = async (req, res) => {
  try {
    const policy = await ReturnPolicy.findById(req.params.id);
    if (!policy) return res.status(404).json({ message: 'Return policy not found' });

    await policy.deleteOne();
    res.json({ message: 'Return policy deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
