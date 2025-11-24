import mongoose from 'mongoose';
import Order from '../models/Order.js';
import OrderService from '../services/orderServices.js';
import { notificationEmitter } from '../events/notificationEmitter.js';
import Product from '../models/Product.js';
import StockService from '../services/StockService.js';

export const createOrder = async (req, res, next) => {
  let session = null;

  try {
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

    if (statusPriority[newStatus] < statusPriority[order.status]) {
      return res.status(400).json({
        success: false,
        message: `Cannot revert order status from ${order.status} to ${newStatus}`,
      });
    }

    const oldStatus = order.status;
    order.status = newStatus;

    // Decrease stock when status changes to shipped or delivered
    if ((newStatus === 'shipped' || newStatus === 'delivered') && 
        oldStatus !== 'shipped' && oldStatus !== 'delivered') {
      for (const item of order.items) {
        await StockService.decreaseStock(item.productId, item.quantity);
      }
    }

    // Restore stock if order is cancelled
    if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
      for (const item of order.items) {
        await StockService.increaseStock(item.productId, item.quantity);
      }
    }

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

    // Decrease stock when status changes to shipped or delivered
    if ((newStatus === 'shipped' || newStatus === 'delivered') && 
        oldStatus !== 'shipped' && oldStatus !== 'delivered') {
      for (const item of order.items) {
        await StockService.decreaseStock(item.productId, item.quantity);
      }
    }

    // Restore stock if order is cancelled
    if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
      for (const item of order.items) {
        await StockService.increaseStock(item.productId, item.quantity);
      }
    }

    await order.save();

    await order.populate('userId', 'fullname email');
    await order.populate({
      path: 'items.productId',
      select: 'title primaryImage seller_id',
      populate: { path: 'seller_id', select: 'fullname email' },
    });
    await order.populate('appliedCoupons', 'code type value');

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

    // Decrease stock when status changes to shipped or delivered
    if ((newStatus === 'shipped' || newStatus === 'delivered') && 
        oldStatus !== 'shipped' && oldStatus !== 'delivered') {
      for (const item of order.items) {
        await StockService.decreaseStock(item.productId, item.quantity);
      }
    }

    // Restore stock if order is cancelled
    if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
      for (const item of order.items) {
        await StockService.increaseStock(item.productId, item.quantity);
      }
    }

    await order.save();

    await order.populate('userId', 'fullname email');
    await order.populate({
      path: 'items.productId',
      select: 'title primaryImage seller_id',
    });
    await order.populate('appliedCoupons', 'code type value');

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

export const restoreOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, error: 'Order not found' });

    await order.restore();
    res.status(200).json({
      success: true,
      message: 'Order restored',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

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

export const getSellerOrders = async (req, res, next) => {
  try {
    const { sellerId } = req.params;

    const sellerProducts = await Product.find({ seller_id: sellerId }, '_id');
    const productIds = sellerProducts.map((p) => p._id);

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

    const filteredOrders = orders.map((order) => {
      const orderObj = order.toObject();

      const sellerItems = orderObj.items.filter((item) => {
        const productIdStr =
          item.productId?._id?.toString() || item.productId?.toString();
        return productIds.some((id) => id.toString() === productIdStr);
      });

      const sellerTotal = sellerItems.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0);

      return {
        ...orderObj,
        items: sellerItems,
        sellerTotal,
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
