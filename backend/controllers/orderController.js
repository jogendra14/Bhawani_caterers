import Order from "../models/Order.js";
import OrderMenu from "../models/OrderMenu.js";

// Helper to calculate total event days
const calculateTotalDays = (startDate, endDate) => {
  if (!startDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate || startDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
};

/*
|--------------------------------------------------------------------------
| GET ALL ORDERS
|--------------------------------------------------------------------------
*/

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({
      startDate: 1,
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE ORDER
|--------------------------------------------------------------------------
*/

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
*/

export const createOrder = async (req, res) => {
  try {
    const { startDate, endDate, address, clientName, phone, status } = req.body;
    
    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "Order start date is required",
      });
    }

    if (!address?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    if (!clientName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Client name is required",
      });
    }

    if (!phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    const order = await Order.create({
      startDate,
      endDate: endDate || startDate,
      address: address.trim(),
      clientName: clientName.trim(),
      phone: phone.trim(),
      status: status || "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE ORDER
|--------------------------------------------------------------------------
*/

export const updateOrder = async (req, res) => {
  try {
    const { startDate, endDate, address, clientName, phone, status } = req.body;

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "Order start date is required",
      });
    }

    if (!address?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    if (!clientName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Client name is required",
      });
    }

    if (!phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const finalEndDate = endDate || startDate;

    /*
    |--------------------------------------------------------------------------
    | UPDATE ORDER
    |--------------------------------------------------------------------------
    */

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        startDate,
        endDate: finalEndDate,
        address: address.trim(),
        clientName: clientName.trim(),
        phone: phone.trim(),
        status: status || "Pending",
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | SYNCHRONIZE ORDER MENU DAYS & DATES
    |--------------------------------------------------------------------------
    | If the event duration changed (e.g. 2 days -> 1 day), prune removed days.
    | Also update the date on every retained day to match the new startDate.
    */
    const totalDays = calculateTotalDays(startDate, finalEndDate);
    const orderMenu = await OrderMenu.findOne({ order: order._id });

    if (orderMenu && Array.isArray(orderMenu.days)) {
      const start = new Date(startDate);

      // Keep only days 1..totalDays
      const synchronizedDays = orderMenu.days
        .filter((d) => d.day >= 1 && d.day <= totalDays)
        .map((d) => {
          const dayDate = new Date(start);
          dayDate.setDate(dayDate.getDate() + (d.day - 1));
          
          const plain = d.toObject ? d.toObject() : d;
          return {
            ...plain,
            date: dayDate,
          };
        });

      orderMenu.days = synchronizedDays;
      await orderMenu.save();
    }

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE ORDER
|--------------------------------------------------------------------------
*/

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Cascade delete associated menu
    await OrderMenu.deleteOne({ order: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Order and associated menu deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete order",
    });
  }
};
