import mongoose from "mongoose";

const orderMenuSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | ORDER
    |--------------------------------------------------------------------------
    */

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },

    /*
    |--------------------------------------------------------------------------
    | DAY WISE MENU
    |--------------------------------------------------------------------------
    */

    days: [
      {
        day: {
          type: Number,
          required: true,
        },

        date: {
          type: Date,
          required: true,
        },

        /*
        |--------------------------------------------------------------------------
        | TIME WISE MENU
        |--------------------------------------------------------------------------
        */

        times: {
          Morning: {
            persons: {
              type: Number,
              default: 0,
            },
            items: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item",
              },
            ],
          },

          Afternoon: {
            persons: {
              type: Number,
              default: 0,
            },
            items: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item",
              },
            ],
          },

          Evening: {
            persons: {
              type: Number,
              default: 0,
            },
            items: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item",
              },
            ],
          },

          Night: {
            persons: {
              type: Number,
              default: 0,
            },
            items: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item",
              },
            ],
          },
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const OrderMenu = mongoose.model("OrderMenu", orderMenuSchema);

export default OrderMenu;
