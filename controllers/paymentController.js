const Payment = require('../models/Payment');

// Ödəniş et
exports.createPayment = async (req, res) => {
  try {
    const { product, amount } = req.body;
    const payment = await Payment.create({
      buyer: req.userId,
      product,
      amount,
      status: 'completed'
    });
    res.status(201).json(payment);
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ error: 'Ödəniş alınmadı' });
  }
};

// Öz ödənişlərini al
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ buyer: req.userId }).populate('product');
    res.json(payments);
  } catch (err) {
    console.error('Get payments error:', err);
    res.status(500).json({ error: 'Ödənişlər alınmadı' });
  }
};
