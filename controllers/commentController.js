const Comment = require('../models/Comment');
const User = require('../models/User');
const { io } = require('../server');

exports.getCommentsWithReplies = async (req, res) => {
  try {
    const allComments = await Comment.find({ productId: req.params.productId })
      .populate('userId', 'name profileImage')
      .populate({
        path: 'parentId',
        populate: { path: 'userId', select: 'name profileImage' },
      })
      .sort({ createdAt: 1 });

    res.status(200).json(allComments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load comments' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { productId, text, parentId } = req.body;
    const userId = req.user.id;

   const commentText = text.trim(); 

    const newComment = new Comment({ productId, userId, text: commentText, parentId: parentId || null });
    await newComment.save();

    const populated = await Comment.findById(newComment._id)
      .populate('userId', 'name profileImage')
      .populate({
        path: 'parentId',
        populate: { path: 'userId', select: 'name profileImage' },
      });

    io.of('/comments').emit('newComment', populated);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Şərh əlavə olunmadı', error: err });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Şərh tapılmadı' });

    await Comment.deleteMany({
      $or: [
        { _id: comment._id },
        { parentId: comment._id }
      ]
    });

    io.of('/comments').emit('deleteComment', comment._id);
    res.status(200).json({ message: 'Şərh və cavablar silindi' });
  } catch (err) {
    res.status(500).json({ message: 'Silinmə uğursuz oldu', error: err });
  }
};
