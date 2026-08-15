// src/components/Items.jsx
import { useState, useMemo } from "react";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiLayers,
  FiX,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiPackage,
} from "react-icons/fi";

import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
} from "../hooks/useItems.js";
import { useMaterials } from "../hooks/useMaterials.js";

export default function Items() {
  const { data: items = [], isLoading, isError, error: itemsError } = useItems();
  const { data: rawMaterials = [] } = useMaterials();
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeItemId, setActiveItemId] = useState(null);

  // Modal Form states
  const [name, setName] = useState("");
  const [selectedRawMaterials, setSelectedRawMaterials] = useState([]);
  const [modalMaterialSearch, setModalMaterialSearch] = useState("");
  const [formError, setFormError] = useState("");

  const saving = createItem.isPending || updateItem.isPending;

  // Filtered items based on search query (search by dish name or ingredient name)
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) => {
      const matchName = item.name?.toLowerCase().includes(q);
      const matchIngredient = (item.rawMaterials || []).some((m) =>
        (m.name || "").toLowerCase().includes(q)
      );
      return matchName || matchIngredient;
    });
  }, [items, searchQuery]);

  // Filtered raw materials inside Add/Edit modal
  const filteredModalMaterials = useMemo(() => {
    const sorted = [...rawMaterials].sort((a, b) => {
      const aSel = selectedRawMaterials.includes(String(a._id));
      const bSel = selectedRawMaterials.includes(String(b._id));
      if (aSel && !bSel) return -1;
      if (!aSel && bSel) return 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });

    if (!modalMaterialSearch.trim()) return sorted;
    const q = modalMaterialSearch.toLowerCase();
    return sorted.filter((m) => m.name.toLowerCase().includes(q));
  }, [rawMaterials, selectedRawMaterials, modalMaterialSearch]);

  const openAddModal = () => {
    setEditingItem(null);
    setName("");
    setSelectedRawMaterials([]);
    setModalMaterialSearch("");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setName(item.name || "");
    const materialIds = (item.rawMaterials || []).map((m) =>
      String(m?._id || m)
    );
    setSelectedRawMaterials(materialIds);
    setModalMaterialSearch("");
    setFormError("");
    setIsModalOpen(true);
    setActiveItemId(null);
  };

  const closeModal = () => {
    if (saving) return;
    setEditingItem(null);
    setName("");
    setSelectedRawMaterials([]);
    setModalMaterialSearch("");
    setFormError("");
    setIsModalOpen(false);
  };

  const toggleRawMaterial = (materialId) => {
    const id = String(materialId);
    setSelectedRawMaterials((curr) =>
      curr.includes(id) ? curr.filter((i) => i !== id) : [...curr, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredModalMaterials.map((m) => String(m._id));
    setSelectedRawMaterials((curr) => [...new Set([...curr, ...filteredIds])]);
  };

  const handleClearSelection = () => {
    setSelectedRawMaterials([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const itemName = name.trim();
    if (!itemName) {
      setFormError("Item name is required");
      return;
    }
    if (selectedRawMaterials.length === 0) {
      setFormError("Please select at least one raw material");
      return;
    }

    try {
      setFormError("");
      if (editingItem) {
        await updateItem.mutateAsync({
          id: editingItem._id,
          data: {
            name: itemName,
            rawMaterials: selectedRawMaterials,
          },
        });
      } else {
        await createItem.mutateAsync({
          name: itemName,
          rawMaterials: selectedRawMaterials,
        });
      }
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save item");
    }
  };

  const handleDelete = (item) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${item.name}"?`);
    if (!confirmed) return;
    deleteItem.mutate(item._id);
  };

  const itemsPerColumn = 30;
  const totalColumns = Math.ceil(filteredItems.length / itemsPerColumn) || 1;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Items & Dishes Catalog
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} dishes mapped with raw ingredients for catering
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <FiPlus className="text-lg" /> Add Dish / Item
        </button>
      </div>

      {/* Search & Info Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search items by name or ingredients (e.g., Paneer, Dal, Shahi Paneer)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="rounded-lg bg-slate-100 px-3 py-2">
            Showing {filteredItems.length} of {items.length} Items
          </span>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
          {itemsError?.response?.data?.message || "Failed to load items list."}
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="mt-4 text-sm font-medium text-slate-500">Loading dishes & items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-500">
            <FiLayers size={24} />
          </div>
          <p className="mt-4 text-base font-semibold text-slate-800">
            {items.length === 0 ? "No dishes created yet" : "No dishes match your search"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {items.length === 0
              ? "Add your first dish along with its raw ingredients."
              : "Try searching with a different name or ingredient."}
          </p>
          {items.length === 0 && (
            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <FiPlus /> Add First Dish
            </button>
          )}
        </div>
      ) : (
        /* Multi-column list display */
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex min-w-max gap-4">
            {Array.from({ length: totalColumns }).map((_, colIdx) => {
              const start = colIdx * itemsPerColumn;
              const columnItems = filteredItems.slice(start, start + itemsPerColumn);

              return (
                <div
                  key={colIdx}
                  className="w-96 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span className="w-10 text-center">#</span>
                    <span className="flex-1">Dish Name & Materials</span>
                    <span className="w-16 text-center">Actions</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {columnItems.map((item, idx) => {
                      const globalIdx = start + idx + 1;
                      const isExpanded = activeItemId === item._id;
                      const matCount = (item.rawMaterials || []).length;

                      return (
                        <div
                          key={item._id || globalIdx}
                          className="transition-colors hover:bg-slate-50/70"
                        >
                          <div
                            onClick={() =>
                              setActiveItemId(isExpanded ? null : item._id)
                            }
                            className="flex cursor-pointer items-center px-4 py-3 text-sm"
                          >
                            <span className="w-10 text-center text-xs font-semibold text-slate-400">
                              {globalIdx}.
                            </span>

                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-center gap-2">
                                <p className="truncate font-bold text-slate-900">
                                  {item.name}
                                </p>
                                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                                  {matCount} ingredients
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(item);
                                }}
                                title="Edit item"
                                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                              >
                                <FiEdit2 size={15} />
                              </button>

                              <button
                                type="button"
                                disabled={deleteItem.isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item);
                                }}
                                title="Delete item"
                                className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                              >
                                <FiTrash2 size={15} />
                              </button>

                              <button
                                type="button"
                                className="p-1 text-slate-400"
                              >
                                {isExpanded ? (
                                  <FiChevronUp size={14} />
                                ) : (
                                  <FiChevronDown size={14} />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Ingredients Details */}
                          {isExpanded && (
                            <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 text-xs">
                              <p className="mb-2 font-bold uppercase tracking-wider text-slate-400">
                                Mapped Ingredients ({matCount}):
                              </p>
                              {matCount === 0 ? (
                                <p className="italic text-slate-400">No ingredients mapped</p>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                  {item.rawMaterials.map((mat, mIdx) => (
                                    <span
                                      key={mat._id || mIdx}
                                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 font-medium text-slate-700 shadow-2xs"
                                    >
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                      {mat.name || mat}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================
          UPGRADED ADD / EDIT ITEM MODAL
      ===================================================== */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          onMouseDown={closeModal}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl transition-all"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingItem ? "Edit Dish / Item" : "Add New Dish / Item"}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingItem
                    ? "Update item details and raw material mapping"
                    : "Specify dish name and map required ingredients"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Error in modal */}
            {formError && (
              <div className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
                {formError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Dish / Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shahi Paneer, Dal Tadka, Gulab Jamun"
                  autoFocus
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              {/* Raw Materials Selection Section */}
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Select Raw Materials ({selectedRawMaterials.length} selected)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Select All Filtered
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="text-xs font-semibold text-slate-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Filter Search inside Modal */}
                <div className="relative mb-3">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search raw ingredients to map (e.g., Paneer, Oil, Ghee)..."
                    value={modalMaterialSearch}
                    onChange={(e) => setModalMaterialSearch(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-8 text-xs text-slate-800 outline-none transition focus:border-slate-900 focus:bg-white"
                  />
                  {modalMaterialSearch && (
                    <button
                      type="button"
                      onClick={() => setModalMaterialSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <FiX size={12} />
                    </button>
                  )}
                </div>

                {/* Selected Material Chips */}
                {selectedRawMaterials.length > 0 && (
                  <div className="mb-3 flex max-h-20 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-2">
                    {selectedRawMaterials.map((matId) => {
                      const matObj = rawMaterials.find(
                        (m) => String(m._id) === String(matId)
                      );
                      const matLabel = matObj?.name || matId;
                      return (
                        <span
                          key={matId}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white"
                        >
                          {matLabel}
                          <button
                            type="button"
                            onClick={() => toggleRawMaterial(matId)}
                            className="text-slate-300 hover:text-white"
                          >
                            <FiX size={12} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Scrollable Checkbox List */}
                <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white max-h-56">
                  {rawMaterials.length === 0 ? (
                    <p className="p-6 text-center text-xs text-slate-400">
                      No raw materials found in inventory.
                    </p>
                  ) : filteredModalMaterials.length === 0 ? (
                    <p className="p-6 text-center text-xs text-slate-400">
                      No raw materials match "{modalMaterialSearch}"
                    </p>
                  ) : (
                    filteredModalMaterials.map((mat) => {
                      const id = String(mat._id);
                      const isSelected = selectedRawMaterials.includes(id);
                      return (
                        <label
                          key={id}
                          className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-xs transition ${
                            isSelected
                              ? "bg-slate-50 font-bold text-slate-900"
                              : "hover:bg-slate-50/60 text-slate-700"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRawMaterial(id)}
                              className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                            />
                            <span>{mat.name}</span>
                          </span>

                          {isSelected && (
                            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                              Selected
                            </span>
                          )}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving
                    ? editingItem
                      ? "Updating..."
                      : "Adding..."
                    : editingItem
                    ? "Save Changes"
                    : "Add Dish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
