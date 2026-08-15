import Order from "../models/Order.js";
import OrderMenu from "../models/OrderMenu.js";

/*
|--------------------------------------------------------------------------
| SAVE / UPDATE ORDER MENU
|--------------------------------------------------------------------------
*/

export const saveOrderMenu = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { days } = req.body;

    console.log("Order ID:", orderId);
    console.log("Days:", days);

    /*
    |--------------------------------------------------------------------------
    | CHECK ORDER
    |--------------------------------------------------------------------------
    */

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!Array.isArray(days)) {
      return res.status(400).json({
        success: false,
        message: "Days must be an array",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CLEAN DATA
    |--------------------------------------------------------------------------
    */

    const cleanedDays = days.map((day) => ({
      day: day.day,
      date: day.date,

      times: {
        Morning: (day.times?.Morning || []).map(
          (item) => item._id || item
        ),

        Afternoon: (day.times?.Afternoon || []).map(
          (item) => item._id || item
        ),

        Evening: (day.times?.Evening || []).map(
          (item) => item._id || item
        ),

        Night: (day.times?.Night || []).map(
          (item) => item._id || item
        ),
      },
    }));

    /*
    |--------------------------------------------------------------------------
    | CREATE / UPDATE
    |--------------------------------------------------------------------------
    */

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
    );

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

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

    const orderMenu = await OrderMenu.findOne({
      order: orderId,
    }).populate(
      "days.times.Morning days.times.Afternoon days.times.Evening days.times.Night"
    );

    if (!orderMenu) {
      return res.status(200).json({
        success: true,
        orderMenu: null,
      });
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