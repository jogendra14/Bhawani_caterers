// src/components/orders/AddMenu.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiSave,
  FiArrowLeft,
  FiCheck,
  FiPlus,
  FiX,
  FiCopy,
  FiSearch,
  FiClock,
  FiCalendar,
  FiUsers,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { useItems } from "../../hooks/useItems.js";
import {
  useOrder,
  useOrderMenu,
  useSaveOrderMenu,
} from "../../hooks/useOrders.js";
import { formatSavedMenuToDayDetails } from "../../utils/menuUtils.js";

const times = ["Morning", "Afternoon", "Evening", "Night"];

export default function AddMenu() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const {
    data: order,
    isLoading: orderLoading,
    isError,
    error: orderError,
  } = useOrder(orderId);

  const { data: savedMenu, isLoading: menuLoading } = useOrderMenu(orderId);
  const { data: menuItems = [], isLoading: itemsLoading } = useItems();
  const saveOrderMenu = useSaveOrderMenu();

  const [error, setError] = useState("");
  const [menuSearch, setMenuSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedTime, setSelectedTime] = useState("Morning");
  const [dayDetails, setDayDetails] = useState({});

  // Copy modal state
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copySourceDay, setCopySourceDay] = useState(1);
  const [copySourceTime, setCopySourceTime] = useState("Morning");

  const menuInitialized = useRef(false);

  /* TOTAL DAYS CALCULATION */
  const totalDays = useMemo(() => {
    if (!order?.startDate) return 1;
    const start = new Date(order.startDate);
    const end = new Date(order.endDate || order.startDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  }, [order?.startDate, order?.endDate]);

  /* GET DAY DATE */
  const getDayDate = (dayNumber) => {
    if (!order?.startDate) return new Date();
    const date = new Date(order.startDate);
    date.setDate(date.getDate() + (dayNumber - 1));
    return date;
  };

  /* FORMAT DATE */
  const formatDate = (date) => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  /* INITIALIZE DAY TEMPLATE */
  const createDayDetails = (dayNumber) => {
    const date = getDayDate(dayNumber);

    return {
      day: dayNumber,
      date: date.toISOString().split("T")[0],

      times: {
        Morning: { persons: 0, items: [] },
        Afternoon: { persons: 0, items: [] },
        Evening: { persons: 0, items: [] },
        Night: { persons: 0, items: [] },
      },
    };
  };

  // Sync savedMenu into dayDetails and restrict strictly to totalDays
  useEffect(() => {
    if (savedMenu && !menuInitialized.current) {
      menuInitialized.current = true;
      const formatted = formatSavedMenuToDayDetails(savedMenu);

      // Prune any day keys that exceed current totalDays
      const filtered = {};
      for (let d = 1; d <= totalDays; d++) {
        if (formatted[d]) {
          filtered[d] = {
            ...formatted[d],
            date: getDayDate(d).toISOString().split("T")[0],
          };
        } else {
          filtered[d] = createDayDetails(d);
        }
      }
      setDayDetails(filtered);
    } else if (!savedMenu && order && !menuInitialized.current) {
      // Initialize all days if no savedMenu exists
      menuInitialized.current = true;
      const initial = {};
      for (let d = 1; d <= totalDays; d++) {
        initial[d] = createDayDetails(d);
      }
      setDayDetails(initial);
    }
  }, [savedMenu, order, totalDays]);

  // Ensure selectedDay is within bounds
  useEffect(() => {
    if (selectedDay > totalDays) {
      setSelectedDay(1);
    }
  }, [totalDays, selectedDay]);

  /* DAY CLICK */
  const handleDayClick = (dayNumber) => {
    setSelectedDay(dayNumber);
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

  /* TIME CLICK */
  const handleTimeClick = (time) => {
    setSelectedTime(time);
    setMenuSearch("");
  };

  /* PERSONS CHANGE */
  const handlePersonsChange = (count) => {
    const persons = Math.max(0, Number(count) || 0);
    setDayDetails((current) => {
      const dayData = current[selectedDay] || createDayDetails(selectedDay);
      const currentTimeData = dayData.times[selectedTime] || {
        persons: 0,
        items: [],
      };

      return {
        ...current,
        [selectedDay]: {
          ...dayData,
          times: {
            ...dayData.times,
            [selectedTime]: {
              ...currentTimeData,
              persons,
            },
          },
        },
      };
    });
  };

  /* ADD MENU ITEM */
  const handleAddMenuItem = (item) => {
    if (!selectedDay || !selectedTime) return;

    setDayDetails((current) => {
      const dayData = current[selectedDay] || createDayDetails(selectedDay);
      const currentTimeData = dayData.times[selectedTime] || {
        persons: 0,
        items: [],
      };
      const currentItems = currentTimeData.items || [];

      // Prevent duplicates
      const alreadyExists = currentItems.some(
        (menuItem) => (menuItem._id || menuItem) === (item._id || item)
      );
      if (alreadyExists) return current;

      return {
        ...current,
        [selectedDay]: {
          ...dayData,
          times: {
            ...dayData.times,
            [selectedTime]: {
              ...currentTimeData,
              items: [...currentItems, item],
            },
          },
        },
      };
    });
  };

  /* REMOVE MENU ITEM */
  const handleRemoveMenuItem = (itemId) => {
    if (!selectedDay || !selectedTime) return;

    setDayDetails((current) => {
      const dayData = current[selectedDay];
      if (!dayData) return current;
      const currentTimeData = dayData.times[selectedTime];
      if (!currentTimeData) return current;

      const currentItems = currentTimeData.items || [];
      return {
        ...current,
        [selectedDay]: {
          ...dayData,
          times: {
            ...dayData.times,
            [selectedTime]: {
              ...currentTimeData,
              items: currentItems.filter(
                (item) => (item._id || item) !== itemId
              ),
            },
          },
        },
      };
    });
  };

  /* COPY MENU SESSION */
  const handleCopySession = () => {
    const sourceItems =
      dayDetails[copySourceDay]?.times?.[copySourceTime]?.items || [];
    const sourcePersons =
      dayDetails[copySourceDay]?.times?.[copySourceTime]?.persons || 0;

    if (sourceItems.length === 0) {
      toast.error(
        `Day ${copySourceDay} (${copySourceTime}) has no items to copy.`
      );
      return;
    }

    setDayDetails((current) => {
      const targetDayData =
        current[selectedDay] || createDayDetails(selectedDay);
      const targetTimeData = targetDayData.times[selectedTime] || {
        persons: 0,
        items: [],
      };

      // Merge items without duplicates
      const existingIds = new Set(
        (targetTimeData.items || []).map((i) => i._id || i)
      );
      const newItems = [...(targetTimeData.items || [])];

      sourceItems.forEach((it) => {
        const id = it._id || it;
        if (!existingIds.has(id)) {
          existingIds.add(id);
          newItems.push(it);
        }
      });

      return {
        ...current,
        [selectedDay]: {
          ...targetDayData,
          times: {
            ...targetDayData.times,
            [selectedTime]: {
              persons: targetTimeData.persons || sourcePersons,
              items: newItems,
            },
          },
        },
      };
    });

    toast.success(
      `Copied ${sourceItems.length} items from Day ${copySourceDay} (${copySourceTime}) to Day ${selectedDay} (${selectedTime})`
    );
    setIsCopyModalOpen(false);
  };

  /* FILTER MENU ITEMS */
  const filteredMenuItems = useMemo(() => {
    if (!menuSearch.trim()) return menuItems;
    const q = menuSearch.toLowerCase();
    return menuItems.filter((item) =>
      item.name?.toLowerCase().includes(q)
    );
  }, [menuItems, menuSearch]);

  /* CURRENT SELECTED ITEMS & PERSONS */
  const currentSlot =
    dayDetails[selectedDay]?.times?.[selectedTime] || { persons: 0, items: [] };
  const selectedItems = currentSlot.items || [];
  const currentPersons = currentSlot.persons || "";

  /* SAVE MENU HANDLER */
  const handleSaveMenu = async () => {
    try {
      setError("");

      // Strictly extract only days from 1 to totalDays with correct dates
      const daysToSave = [];
      for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
        const dData = dayDetails[dayNum] || createDayDetails(dayNum);
        const dayDate = getDayDate(dayNum);

        daysToSave.push({
          day: dayNum,
          date: dayDate.toISOString().split("T")[0],
          times: {
            Morning: {
              persons: Number(dData.times?.Morning?.persons || 0),
              items: (dData.times?.Morning?.items || []).map(
                (item) => item._id || item
              ),
            },
            Afternoon: {
              persons: Number(dData.times?.Afternoon?.persons || 0),
              items: (dData.times?.Afternoon?.items || []).map(
                (item) => item._id || item
              ),
            },
            Evening: {
              persons: Number(dData.times?.Evening?.persons || 0),
              items: (dData.times?.Evening?.items || []).map(
                (item) => item._id || item
              ),
            },
            Night: {
              persons: Number(dData.times?.Night?.persons || 0),
              items: (dData.times?.Night?.items || []).map(
                (item) => item._id || item
              ),
            },
          },
        });
      }

      await saveOrderMenu.mutateAsync({ orderId, days: daysToSave });
      navigate(`/admin/orders/${orderId}`);
    } catch (saveError) {
      console.error("Save menu error:", saveError);
      setError(
        saveError.response?.data?.message || "Failed to save menu schedule"
      );
    }
  };

  if (orderLoading || menuLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-20">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        <p className="mt-4 text-sm font-medium text-slate-500">
          Loading catering event & menu data...
        </p>
      </div>
    );
  }

  if ((isError || error) && !order) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-base font-semibold text-red-700">
            {error ||
              orderError?.response?.data?.message ||
              "Failed to fetch order"}
          </p>
          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <FiArrowLeft /> Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* =========================================================
          STICKY TOPBAR ACTIONS
      ========================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/admin/orders/${orderId}`)}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-xs transition hover:bg-slate-50"
              title="Back to Order Detail"
            >
              <FiArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Menu Setup: {order?.clientName}
              </h1>
              <p className="text-xs text-slate-500">
                Configure day-by-day and session-by-session food & catering menus
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate(`/admin/orders/${orderId}`)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveMenu}
            disabled={saveOrderMenu.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
          >
            <FiSave size={15} />
            {saveOrderMenu.isPending ? "Saving Menu..." : "Save All Menus"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* =========================================================
          ORDER DETAILS SUMMARY BAR
      ========================================================= */}
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Client
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {order?.clientName}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Phone
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">
            {order?.phone}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Event Duration
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {formatDate(order?.startDate)} → {formatDate(order?.endDate || order?.startDate)}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Event Days
          </p>
          <p className="mt-1 text-sm font-bold text-blue-600">
            {totalDays} {totalDays === 1 ? "Day Event" : "Days Event"}
          </p>
        </div>
      </div>

      {/* =========================================================
          DAY PICKER CAROUSEL / SELECTOR
      ========================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Select Event Day
            </h2>
            <p className="text-xs text-slate-400">
              Event spans {totalDays} {totalDays === 1 ? "day" : "days"}. Click a day to configure dishes.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            Day {selectedDay} of {totalDays}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {Array.from({ length: totalDays }, (_, index) => {
            const dayNum = index + 1;
            const date = getDayDate(dayNum);
            const active = selectedDay === dayNum;

            // Check if this day has any items in any session
            const dayItemCount = ["Morning", "Afternoon", "Evening", "Night"].reduce(
              (acc, time) =>
                acc +
                (dayDetails[dayNum]?.times?.[time]?.items?.length || 0),
              0
            );

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => handleDayClick(dayNum)}
                className={`relative flex flex-col rounded-xl border p-3.5 text-left transition-all ${
                  active
                    ? "border-slate-950 bg-slate-900 text-white shadow-md"
                    : "border-slate-200 bg-slate-50/70 text-slate-800 hover:border-slate-300 hover:bg-white"
                }`}
              >
                {dayItemCount > 0 && (
                  <span
                    className={`absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold ${
                      active
                        ? "bg-emerald-400 text-slate-950"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    ✓
                  </span>
                )}

                <p className="font-bold text-sm">Day {dayNum}</p>
                <p
                  className={`mt-0.5 text-xs ${
                    active ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {formatDate(date)}
                </p>
                <p
                  className={`mt-2 text-[11px] font-medium ${
                    active ? "text-slate-200" : "text-slate-500"
                  }`}
                >
                  {dayItemCount} {dayItemCount === 1 ? "dish" : "dishes"}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          SESSION TABS (Morning, Afternoon, Evening, Night)
      ========================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Day {selectedDay} Meal Sessions
            </h2>
            <p className="text-xs text-slate-500">
              Select meal time, set guest count, and add catering dishes
            </p>
          </div>

          {/* Copy Menu Quick Action */}
          <button
            type="button"
            onClick={() => setIsCopyModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <FiCopy size={13} /> Copy Menu from other Session
          </button>
        </div>

        {/* 4 Session Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {times.map((time) => {
            const timeSlot = dayDetails[selectedDay]?.times?.[time];
            const items = timeSlot?.items || [];
            const persons = timeSlot?.persons || 0;
            const active = selectedTime === time;

            return (
              <button
                key={time}
                type="button"
                onClick={() => handleTimeClick(time)}
                className={`relative rounded-xl border p-3.5 text-left transition-all ${
                  active
                    ? "border-blue-600 bg-blue-50/80 ring-2 ring-blue-600/10"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FiClock
                      className={`text-xs ${
                        active ? "text-blue-600" : "text-slate-400"
                      }`}
                    />
                    <span
                      className={`text-sm font-bold ${
                        active ? "text-blue-900" : "text-slate-800"
                      }`}
                    >
                      {time}
                    </span>
                  </div>

                  {items.length > 0 && (
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                      ✓
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {items.length} {items.length === 1 ? "dish" : "dishes"}
                  </span>
                  {persons > 0 ? (
                    <span className="font-semibold text-blue-600">
                      {persons} pax
                    </span>
                  ) : (
                    <span className="text-slate-400">0 pax</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* =========================================================
            ACTIVE SESSION EDITOR (PERSONS & SEARCH & SELECTED ITEMS)
        ========================================================= */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">
                Day {selectedDay} • {selectedTime}
              </span>
              <span className="text-xs text-slate-500">
                {selectedItems.length} items added
              </span>
            </div>

            {/* Guest / Headcount input */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <FiUsers className="text-slate-400" /> Guest Count (Pax):
              </label>
              <input
                type="number"
                min="0"
                value={currentPersons}
                onChange={(e) => handlePersonsChange(e.target.value)}
                placeholder="e.g. 250"
                className="w-28 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>

          {/* Two-Column Search & Add Layout */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Left: Dish Catalog Search */}
            <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="border-b border-slate-100 p-3">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="Search dishes to add (e.g. Paneer, Naan, Gulab Jamun)..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-8 text-xs text-slate-800 outline-none transition focus:border-slate-900 focus:bg-white"
                  />
                  {menuSearch && (
                    <button
                      type="button"
                      onClick={() => setMenuSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <FiX size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Dish List */}
              <div className="h-72 overflow-y-auto divide-y divide-slate-100">
                {itemsLoading ? (
                  <p className="p-6 text-center text-xs text-slate-400">
                    Loading dish catalog...
                  </p>
                ) : filteredMenuItems.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No dishes found matching "{menuSearch}"
                  </div>
                ) : (
                  filteredMenuItems.map((item) => {
                    const isAdded = selectedItems.some(
                      (sel) => (sel._id || sel) === (item._id || item)
                    );

                    return (
                      <div
                        key={item._id}
                        className="flex items-center justify-between px-3.5 py-2.5 text-xs transition hover:bg-slate-50"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="font-semibold text-slate-800 truncate">
                            {item.name}
                          </p>
                          {(item.rawMaterials || []).length > 0 && (
                            <p className="text-[10px] text-slate-400 truncate">
                              {(item.rawMaterials || [])
                                .map((m) => m.name || m)
                                .join(", ")}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={isAdded}
                          onClick={() => handleAddMenuItem(item)}
                          className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                            isAdded
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-slate-950 text-white hover:bg-slate-800 shadow-2xs"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <FiCheck size={12} /> Added
                            </>
                          ) : (
                            <>
                              <FiPlus size={12} /> Add
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Selected Dishes for this Slot */}
            <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/70">
                <span className="text-xs font-bold text-slate-800">
                  Selected Menu Items ({selectedItems.length})
                </span>
                {selectedItems.length > 0 && (
                  <span className="text-[11px] text-slate-400">
                    Day {selectedDay} • {selectedTime}
                  </span>
                )}
              </div>

              <div className="h-72 overflow-y-auto p-3">
                {selectedItems.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center p-4">
                    <p className="text-xs font-semibold text-slate-500">
                      No items added yet
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Select dishes from the left catalog to add them to this meal session.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {selectedItems.map((item, idx) => (
                      <div
                        key={item._id || idx}
                        className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs transition hover:bg-slate-100/70"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-bold text-slate-400">
                            {idx + 1}.
                          </span>
                          <span className="font-semibold text-slate-800 truncate">
                            {item.name || item}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveMenuItem(item._id || item)
                          }
                          className="rounded p-1 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                          title="Remove item"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          COPY MENU MODAL
      ========================================================= */}
      {isCopyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          onMouseDown={() => setIsCopyModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Copy Menu Session
              </h3>
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="space-y-4 py-4">
              <p className="text-xs text-slate-500">
                Copy all configured dishes into currently active session:{" "}
                <span className="font-bold text-slate-900">
                  Day {selectedDay} ({selectedTime})
                </span>
              </p>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Source Day
                </label>
                <select
                  value={copySourceDay}
                  onChange={(e) => setCopySourceDay(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none"
                >
                  {Array.from({ length: totalDays }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Day {i + 1} ({formatDate(getDayDate(i + 1))})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Source Meal Session
                </label>
                <select
                  value={copySourceTime}
                  onChange={(e) => setCopySourceTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none"
                >
                  {times.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCopySession}
                className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Apply & Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
