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
| SAVE / UPDATE ORDER MENU
|--------------------------------------------------------------------------
*/

export const saveOrderMenu = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { days } = req.body || {};

    // ---------------------------------------------------------
    // CHECK ORDER
    // ---------------------------------------------------------

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------

    if (!Array.isArray(days)) {
      return res.status(400).json({
        success: false,
        message: "Days must be an array",
      });
    }

    // Calculate maximum valid days allowed for this event
    const totalDays = calculateTotalDays(order.startDate, order.endDate);
    const startDateObj = new Date(order.startDate);

    // ---------------------------------------------------------
    // CLEAN DATA & PRUNE REMOVED DATES
    // ---------------------------------------------------------

    const cleanedDays = days
      .filter((day) => day && Number(day.day) >= 1 && Number(day.day) <= totalDays)
      .map((day) => {
        const dayNumber = Number(day.day);
        const calculatedDate = new Date(startDateObj);
        calculatedDate.setDate(calculatedDate.getDate() + (dayNumber - 1));

        return {
          day: dayNumber,
          date: calculatedDate,

          times: {
            Morning: {
              persons: Math.max(0, Number(day.times?.Morning?.persons || 0)),
              items: (day.times?.Morning?.items || [])
                .map((item) => item._id || item)
                .filter(Boolean),
            },

            Afternoon: {
              persons: Math.max(0, Number(day.times?.Afternoon?.persons || 0)),
              items: (day.times?.Afternoon?.items || [])
                .map((item) => item._id || item)
                .filter(Boolean),
            },

            Evening: {
              persons: Math.max(0, Number(day.times?.Evening?.persons || 0)),
              items: (day.times?.Evening?.items || [])
                .map((item) => item._id || item)
                .filter(Boolean),
            },

            Night: {
              persons: Math.max(0, Number(day.times?.Night?.persons || 0)),
              items: (day.times?.Night?.items || [])
                .map((item) => item._id || item)
                .filter(Boolean),
            },
          },
        };
      });

    // ---------------------------------------------------------
    // CREATE / UPDATE
    // ---------------------------------------------------------

    const orderMenu = await OrderMenu.findOneAndUpdate(
      {
        order: orderId,
      },
      {
        order: orderId,
        days: cleanedDays,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    ).populate(
      "days.times.Morning.items " +
      "days.times.Afternoon.items " +
      "days.times.Evening.items " +
      "days.times.Night.items"
    );

    // ---------------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Order menu saved successfully",
      orderMenu,
    });
  } catch (error) {
    console.error("Save order menu error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save order menu",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ORDER MENU
|--------------------------------------------------------------------------
*/

export const getOrderMenu = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const totalDays = calculateTotalDays(order.startDate, order.endDate);

    const orderMenu = await OrderMenu.findOne({
      order: orderId,
    }).populate(
      "days.times.Morning.items " +
      "days.times.Afternoon.items " +
      "days.times.Evening.items " +
      "days.times.Night.items"
    );

    if (!orderMenu) {
      return res.status(200).json({
        success: true,
        orderMenu: null,
      });
    }

    // Filter out any days beyond the current event duration if order was updated earlier
    if (Array.isArray(orderMenu.days)) {
      orderMenu.days = orderMenu.days.filter(
        (day) => day.day >= 1 && day.day <= totalDays
      );
    }

    return res.status(200).json({
      success: true,
      orderMenu,
    });
  } catch (error) {
    console.error("Get order menu error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order menu",
      error: error.message,
    });
  }
};
