import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiSave, FiArrowLeft, FiCheck, FiPlus, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

import { useItems } from "../../hooks/useItems.js";
import {
  useOrder,
  useOrderMenu,
  useSaveOrderMenu,
} from "../../hooks/useOrders.js";
import { formatSavedMenuToDayDetails } from "../../utils/menuUtils.js";

const times = ["Morning", "Afternoon", "Evening", "Night"];

const AddMenu = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const {
    data: order,
    isLoading,
    isError,
    error: orderError,
  } = useOrder(orderId);

  const { data: savedMenu } = useOrderMenu(orderId);
  const { data: menuItems = [], isLoading: menuLoading } = useItems();
  const saveOrderMenu = useSaveOrderMenu();

  const [error, setError] = useState("");
  const [menuSearch, setMenuSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [dayDetails, setDayDetails] = useState({});
  const menuInitialized = useRef(false);

  useEffect(() => {
    if (!savedMenu || menuInitialized.current) {
      return;
    }

    menuInitialized.current = true;
    setDayDetails(formatSavedMenuToDayDetails(savedMenu));
  }, [savedMenu]);

  /* TOTAL DAYS-----------------*/
  const getTotalDays = () => {
    if (!order?.startDate || !order?.endDate) {
      return 0;
    }

    const start = new Date(order.startDate);
    const end = new Date(order.endDate);
    const difference = end.getTime() - start.getTime();

    return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalDays = getTotalDays();

  /* GET DAY DATE------------------*/

  const getDayDate = (dayNumber) => {
    const date = new Date(order.startDate);
    date.setDate(date.getDate() + dayNumber - 1);
    return date;
  };

  /* FORMAT DATE--------------------*/
  const formatDate = (date) => {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* INITIALIZE DAY------------------*/
  const createDayDetails = (dayNumber) => {
    const date = getDayDate(dayNumber);

    return {
      day: dayNumber,
      date: date.toISOString().split("T")[0],

      times: {
        Morning: {
          persons: 0,
          items: [],
        },
        Afternoon: {
          persons: 0,
          items: [],
        },
        Evening: {
          persons: 0,
          items: [],
        },
        Night: {
          persons: 0,
          items: [],
        },
      },
    };
  };

  /* DAY CLICK---------------------*/

  const handleDayClick = (dayNumber) => {
    setSelectedDay(dayNumber);
    setSelectedTime(null);
    setMenuSearch("");
    setDayDetails((current) => {
      if (current[dayNumber]) {
        return current;
      }

      return {
        ...current,
        [dayNumber]: createDayDetails(dayNumber),
      };
    });
  };

  /*
  |--------------------------------------------------------------------------
  | TIME CLICK
  |--------------------------------------------------------------------------
  */

  const handleTimeClick = (time) => {
    setSelectedTime(time);

    setMenuSearch("");
  };

  /*
  |--------------------------------------------------------------------------
  | ADD MENU ITEM
  |--------------------------------------------------------------------------
  */

  const handleAddMenuItem = (item) => {
    if (!selectedDay || !selectedTime) {
      return;
    }
    setDayDetails((current) => {
      const dayData = current[selectedDay];
      const currentItems = dayData.times[selectedTime]?.items || [];

      // Prevent duplicate item
      const alreadyExists = currentItems.some((menuItem) => menuItem._id === item._id);
      if (alreadyExists) {
        return current;
      }
      return {
        ...current,
        [selectedDay]: {
          ...dayData,

          times: {
            ...dayData.times,

            [selectedTime]: {
              ...dayData.times[selectedTime],
              items: [...currentItems, item],
            },
          },
        },
      };
    });

    setMenuSearch("");
  };

  /*
  |--------------------------------------------------------------------------
  | REMOVE MENU ITEM
  |--------------------------------------------------------------------------
  */

  const handleRemoveMenuItem = (itemId) => {
    if (!selectedDay || !selectedTime) {
      return;
    }

    setDayDetails((current) => {
      const dayData = current[selectedDay];

      const currentItems = dayData.times[selectedTime]?.items || [];
      return {
        ...current,

        [selectedDay]: {
          ...dayData,

          times: {
            ...dayData.times,

            [selectedTime]: {
              ...dayData.times[selectedTime],
              items: currentItems.filter((item) => item._id !== itemId),
            },
          },
        },
      };
    });
  };

  /*
  |--------------------------------------------------------------------------
  | FILTER MENU ITEMS
  |--------------------------------------------------------------------------
  */

  const filteredMenuItems = menuItems.filter((item) => item.name?.toLowerCase().includes(menuSearch.toLowerCase()));

  /*
  |--------------------------------------------------------------------------
  | CURRENT SELECTED ITEMS
  |--------------------------------------------------------------------------
  */

const selectedItems =
  selectedDay && selectedTime
    ? dayDetails[selectedDay]?.times?.[selectedTime]?.items || []
    : [];
  /*
  |--------------------------------------------------------------------------
  | SAVE MENU
  |--------------------------------------------------------------------------
  */

  const handleSaveMenu = async () => {
    try {
      setError("");
      const days = Object.values(dayDetails);
      await saveOrderMenu.mutateAsync({ orderId, days });
      toast.success("Menu saved successfully");
      navigate(-1);
    } catch (saveError) {
      console.error("Save menu error:", saveError);
      setError(saveError.response?.data?.message || "Failed to save menu");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Loading order...</p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if ((isError || error) && !order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-5 text-red-600">
          {error || orderError?.response?.data?.message || "Failed to fetch order"}
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="sticky top-0 z-20 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold">Menu Setup</h1>

            <button onClick={() => navigate("/admin/orders")} className=" mt-1 flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 ">
              <FiArrowLeft size={16} />
              Back to Orders
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={() => navigate(-1)} className=" rounded-lg bg-gray-200 px-4 py-2text-sm hover:bg-gray-300 ">
              Cancel
            </button>

            <button
              onClick={handleSaveMenu}
              disabled={saveOrderMenu.isPending}
              className=" flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50 "
            >
              <FiSave size={16} />
              {saveOrderMenu.isPending ? "Saving..." : "Save Menu"}
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN
      ========================================================= */}

      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* =======================================================
            ORDER INFORMATION
        ======================================================= */}

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs text-gray-500">Client</p>

              <p className="font-semibold">{order?.clientName}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Phone</p>

              <p className="font-semibold">{order?.phone}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Start Date</p>

              <p className="font-semibold">{formatDate(new Date(order.startDate))}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">End Date</p>

              <p className="font-semibold">{formatDate(new Date(order.endDate))}</p>
            </div>
          </div>
        </div>

        {/* =======================================================
            DAY WISE SETUP
        ======================================================= */}

        <div className="mt-5 rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="font-semibold">Day Wise Setup</h2>

            <p className="mt-1 text-xs text-gray-500">Total {totalDays} days</p>
          </div>

          {/* DAYS */}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {Array.from({ length: totalDays }, (_, index) => {
              const day = index + 1;

              const date = getDayDate(day);

              const saved = !!dayDetails[day];

              const active = selectedDay === day;

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`
                      relative
                      rounded-lg
                      border
                      p-3
                      text-left

                      ${active ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}
                    `}
                >
                  {saved && (
                    <FiCheck
                      className="
                          absolute
                          right-2
                          top-2
                          text-green-500
                        "
                    />
                  )}

                  <p className="font-bold">Day {day}</p>

                  <p className="mt-1 text-xs text-gray-500">{formatDate(date)}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* =======================================================
            TIME SETUP
        ======================================================= */}

        {selectedDay && (
          <div className="mt-5 rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="font-semibold">Day {selectedDay} Menu</h2>

              <p className="mt-1 text-xs text-gray-500">Select time and add menu items</p>
            </div>

            {/* =================================================
                ALL FOUR TIMES
            ================================================= */}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {times.map((time) => {
                const timeSlot = dayDetails[selectedDay]?.times?.[time];
                const items = timeSlot?.items || [];
                const active = selectedTime === time;

                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleTimeClick(time)}
                    className={`
                      relative
                      rounded-lg
                      border
                      p-4
                      text-left
                      transition

                      ${active ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}
                    `}
                  >
                    {items.length > 0 && (
                      <FiCheck
                        className="
                          absolute
                          right-2
                          top-2
                          text-green-500
                        "
                      />
                    )}

                    <p className="font-bold">{time}</p>

                    <p className="mt-1 text-xs text-gray-500">
                      {items.length} item{items.length !== 1 ? "s" : ""}
                    </p>

                    <p className="mt-1 text-xs font-medium text-blue-600">{dayDetails[selectedDay]?.times?.[time]?.persons || 0} Persons</p>
                  </button>
                );
              })}
            </div>

            {/* =================================================
                ADD ITEM
            ================================================= */}

            {selectedTime && (
              <div className="mt-5 border-t pt-3">
                <div className="mb-3 flex items-center gap-20">
                  <div>
                    <h3 className="font-semibold">{selectedTime} Menu</h3>
                    <p className="mt-1 text-xs text-gray-500">Add menu items for this time</p>
                  </div>
                  <div className="">
                    <label htmlFor="" className="font-semibold">
                      Person :{" "}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={dayDetails[selectedDay]?.times?.[selectedTime]?.persons || ""}
                      onChange={(event) => {
                        const value = Number(event.target.value);

                        setDayDetails((current) => ({
                          ...current,

                          [selectedDay]: {
                            ...current[selectedDay],

                            times: {
                              ...current[selectedDay].times,

                              [selectedTime]: {
                                ...current[selectedDay].times[selectedTime],
                                persons: value,
                              },
                            },
                          },
                        }));
                      }}
                      className="ml-2 w-24 rounded-md border border-gray-300 p-1"
                      placeholder="eg. 100"
                    />
                  </div>
                </div>

                {/* SEARCH */}
                <div className="flex p-2">
                  <div className="ml-3 w-1/2 rounded-md">
                    <input
                      type="text"
                      value={menuSearch}
                      onChange={(event) => setMenuSearch(event.target.value)}
                      placeholder="Search menu item..."
                      className="border w-full border-gray-300 px-4 py-4 text-sm outline-none "
                    />

                    {/* MENU ITEMS */}

                    <div className="max-h-120 border-r border-l border-b border-gray-300 overflow-y-auto ">
                      {menuLoading ?
                        <div className="p-5 text-center">
                          <p className="text-sm text-gray-500">Loading menu items...</p>
                        </div>
                      : filteredMenuItems.length === 0 ?
                        <div className="p-5 text-center">
                          <p className="text-sm text-gray-500">No menu items found.</p>
                        </div>
                      : filteredMenuItems.map((item) => {
                          const alreadyAdded = selectedItems.some((selectedItem) => selectedItem._id === item._id);

                          return (
                            <div key={item._id} className=" flex items-center justify-between px-4 py-1.5 ">
                              <div>
                                <p className="text-sm font-semibold">{item.name}</p>
                              </div>

                              <button
                                type="button"
                                disabled={alreadyAdded}
                                onClick={() => handleAddMenuItem(item)}
                                className={`
                                flex
                                items-center
                                gap-1
                                rounded-lg
                                px-3
                                py-1.5
                                text-xs
                                font-semibold
                                
                                ${alreadyAdded ? "cursor-not-allowed bg-gray-100 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-700"}
                                `}
                              >
                                <FiPlus size={14} />

                                {alreadyAdded ? "Added" : "Add"}
                              </button>
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>

                  {/* =================================================
                    SELECTED ITEMS
                    ================================================= */}

                  <div className="pl-3  w-1/2 ml-3 rounded-md">
                    <h4 className="mb-3 text-md font-semibold">Selected Items :</h4>

                    {selectedItems.length === 0 ?
                      <div className="rounded-lg border border-dashed p-5 text-center">
                        <p className="text-sm text-gray-500">No items added for {selectedTime}.</p>
                      </div>
                    : <div className="space-y-2">
                        {selectedItems.map((item, index) => (
                          <div key={index} className=" flex items-center justify-between bg-gray-50 px-4 py-1.5">
                            <div className="flex items-center gap-4">
                              <span>{index + 1}.</span>
                              <p className="text-sm font-semibold">{item.name}</p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveMenuItem(item._id)}
                              className="
                                flex
                                items-center
                                gap-1
                                rounded-lg
                                border
                                border-red-200
                                px-3
                                py-1.5
                                text-xs
                                font-semibold
                                text-red-600
                                hover:bg-red-50
                              "
                            >
                              <FiX size={14} />
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddMenu;
