import mongoose from 'mongoose';
import Order from '../models/Order.js';
import OrderService from '../services/orderServices.js';
import { notificationEmitter } from '../events/notificationEmitter.js';
import Product from '../models/Product.js';

export const createOrder = async (req, res, next) => {
  let session = null;

  try {
    // Only use transactions in production or when explicitly supported
    if (process.env.NODE_ENV === 'production') {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    const userId = req.user.id;
    const couponCodes = req.body.coupons || [];

    const result = await OrderService.createOrder(userId, couponCodes, session);

    const productIds = result.order.items.map((i) => i.productId);
    const products = await Product.find(
      { _id: { $in: productIds } },
      'seller_id'
    );
    const sellerIds = [...new Set(products.map((p) => p.seller_id.toString()))];

    sellerIds.forEach((sellerId) => {
      notificationEmitter.emit('newOrder', {
        orderId: result.order._id,
        buyerId: userId,
        sellerId,
      });
    });

    if (session) {
      await session.commitTransaction();
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { ...result },
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;
    const { newStatus } = req.body;

    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findById(orderId);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });

    const statusPriority = {
      pending: 1,
      cancelled: 2,
      shipped: 3,
      delivered: 4,
    };

    // Only allow status updates if newStatus is same or higher priority
    if (statusPriority[newStatus] < statusPriority[order.status]) {
      return res.status(400).json({
        success: false,
        message: `Cannot revert order status from ${order.status} to ${newStatus}`,
      });
    }

    order.status = newStatus;
    await order.save();

    if (newStatus === 'cancelled') {
      const productIds = order.items.map((i) => i.productId);
      const products = await Product.find(
        { _id: { $in: productIds } },
        'seller_id'
      );
      const sellerIds = [
        ...new Set(products.map((p) => p.seller_id.toString())),
      ];

      // Notification pour chaque vendeur concerné
      sellerIds.forEach((sellerId) => {
        notificationEmitter.emit('orderDeleted', {
          orderId: order._id,
          buyerId: order.userId,
          sellerId,
          status: 'deleted',
        });
      });
    }

    res.json({
      success: true,
      message: 'Order status updated',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// Admin can update order status without restrictions
export const adminUpdateOrderStatus = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;
    const { newStatus } = req.body;

    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findById(orderId).notDeleted();
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });

    const oldStatus = order.status;
    order.status = newStatus;
    await order.save();

    // Populate order data for response
    await order.populate('userId', 'fullname email');
    await order.populate({
      path: 'items.productId',
      select: 'title primaryImage seller_id',
      populate: { path: 'seller_id', select: 'fullname email' },
    });
    await order.populate('appliedCoupons', 'code type value');

    // Send notification if status changed to cancelled
    if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
      const productIds = order.items.map((i) => i.productId);
      const products = await Product.find(
        { _id: { $in: productIds } },
        'seller_id'
      );
      const sellerIds = [
        ...new Set(products.map((p) => p.seller_id.toString())),
      ];

      sellerIds.forEach((sellerId) => {
        notificationEmitter.emit('orderDeleted', {
          orderId: order._id,
          buyerId: order.userId,
          sellerId,
          status: 'deleted',
        });
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order.toObject(),
    });
  } catch (error) {
    next(error);
  }
};

// Seller can update order status for orders containing their products
export const sellerUpdateOrderStatus = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;
    const { newStatus } = req.body;
    const sellerId = req.user.id;

    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findById(orderId).notDeleted();
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });

    // Verify that the seller owns at least one product in this order
    const productIds = order.items.map((item) => item.productId);
    const sellerProducts = await Product.find({
      _id: { $in: productIds },
      seller_id: sellerId,
    });

    if (sellerProducts.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not own any products in this order',
      });
    }

    const oldStatus = order.status;
    order.status = newStatus;
    await order.save();

    // Populate order data for response
    await order.populate('userId', 'fullname email');
    await order.populate({
      path: 'items.productId',
      select: 'title primaryImage seller_id',
    });
    await order.populate('appliedCoupons', 'code type value');

    // Send notification if status changed to cancelled
    if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
      notificationEmitter.emit('orderDeleted', {
        orderId: order._id,
        buyerId: order.userId,
        sellerId,
        status: 'deleted',
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order.toObject(),
    });
  } catch (error) {
    next(error);
  }
};

// get all orders
export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().notDeleted();
    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// ======================== soft delte functions ================================

// Soft delete
export const softDeleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, error: 'Order not found' });

    await order.softDelete();
    res.status(200).json({ success: true, message: 'Order soft deleted' });
  } catch (error) {
    next(error);
  }
};

// Restore
export const restoreOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, error: 'Order not found' });

    await order.restore(); // <-- helper
    res.status(200).json({
      success: true,
      message: 'Order restored',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Get all soft-deleted Orders
export const getDeletedOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().deleted();
    res.status(200).json({
      success: true,
      message: 'Soft deleted order retrieved successfully',
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// get user not deleted orders
export const getUserOrders = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).notDeleted();
    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// get seller orders (orders containing seller's products)
export const getSellerOrders = async (req, res, next) => {
  try {
    const { sellerId } = req.params;

    // Find all products of this seller
    const sellerProducts = await Product.find({ seller_id: sellerId }, '_id');
    const productIds = sellerProducts.map((p) => p._id);

    // Find all orders containing at least one of seller's products
    const orders = await Order.find({
      'items.productId': { $in: productIds },
    })
      .notDeleted()
      .populate('userId', 'fullname email')
      .populate({
        path: 'items.productId',
        select: 'title primaryImage seller_id',
      })
      .populate('appliedCoupons', 'code type value')
      .sort({ createdAt: -1 });

    // Filter items to only show seller's products and recalculate amounts
    const filteredOrders = orders.map((order) => {
      const orderObj = order.toObject();

      // Filter items to only include seller's products
      const sellerItems = orderObj.items.filter((item) => {
        const productIdStr =
          item.productId?._id?.toString() || item.productId?.toString();
        return productIds.some((id) => id.toString() === productIdStr);
      });

      // Calculate total for seller's items
      const sellerTotal = sellerItems.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0);

      return {
        ...orderObj,
        items: sellerItems,
        sellerTotal, // Total for this seller's items only
      };
    });

    res.status(200).json({
      success: true,
      message: 'Seller orders retrieved successfully',
      orders: filteredOrders,
    });
  } catch (error) {
    next(error);
  }
};
