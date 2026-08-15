// src/components/Material.jsx
import { useState } from "react";
import { FiPlus, FiSearch, FiLayers, FiPackage } from "react-icons/fi";
import { useMaterials, useCreateMaterial } from "../hooks/useMaterials.js";

export default function Material() {
  const { data: materials = [], isLoading, isError, error } = useMaterials();
  const createMaterialMutation = useCreateMaterial();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [formError, setFormError] = useState("");

  const filteredMaterials = materials.filter((mat) =>
    mat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setName("");
    setFormError("");
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    if (createMaterialMutation.isPending) return;
    setName("");
    setFormError("");
    setIsAddModalOpen(false);
  };

  const handleAddMaterial = async (event) => {
    event.preventDefault();
    const materialName = name.trim();
    if (!materialName) {
      setFormError("Raw material name is required");
      return;
    }

    try {
      setFormError("");
      await createMaterialMutation.mutateAsync({ name: materialName });
      closeAddModal();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to add raw material");
    }
  };

  // Split into columns for neat multi-column layout
  const itemsPerColumn = 30;
  const totalColumns = Math.ceil(filteredMaterials.length / itemsPerColumn) || 1;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Raw Materials Directory
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {materials.length} raw materials in catering master list
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <FiPlus className="text-lg" /> Add Raw Material
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search raw materials (e.g., Basmati Rice, Ghee, Paneer)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="rounded-lg bg-slate-100 px-3 py-2">
            Showing {filteredMaterials.length} of {materials.length}
          </span>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
          {error?.response?.data?.message || "Failed to load raw materials"}
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="mt-4 text-sm font-medium text-slate-500">Loading raw materials...</p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-500">
            <FiPackage size={24} />
          </div>
          <p className="mt-4 text-base font-semibold text-slate-800">
            {materials.length === 0 ? "No raw materials found" : "No matches found"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {materials.length === 0
              ? "Add raw materials like rice, spices, oil to map to your menu items."
              : "Try searching with a different name."}
          </p>
          {materials.length === 0 && (
            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <FiPlus /> Add First Material
            </button>
          )}
        </div>
      ) : (
        /* Multi-column list display */
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex min-w-max gap-4">
            {Array.from({ length: totalColumns }).map((_, colIdx) => {
              const start = colIdx * itemsPerColumn;
              const columnItems = filteredMaterials.slice(start, start + itemsPerColumn);

              return (
                <div
                  key={colIdx}
                  className="w-80 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <div className="flex items-center border-b border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span className="w-12 text-center">#</span>
                    <span className="flex-1">Material Name</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {columnItems.map((mat, idx) => {
                      const globalIdx = start + idx + 1;
                      return (
                        <div
                          key={mat._id || globalIdx}
                          className="flex items-center px-3.5 py-2 text-sm transition hover:bg-slate-50"
                        >
                          <span className="w-12 text-center text-xs font-semibold text-slate-400">
                            {globalIdx}.
                          </span>
                          <span className="flex-1 truncate font-medium text-slate-800">
                            {mat.name}
                          </span>
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

      {/* Add Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onMouseDown={closeAddModal}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900">Add Raw Material</h2>
              <p className="mt-1 text-sm text-slate-500">
                Register a new raw ingredient or material.
              </p>
            </div>

            {formError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddMaterial} className="space-y-4">
              <div>
                <label
                  htmlFor="materialName"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Material Name
                </label>
                <input
                  id="materialName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pure Desi Ghee, Basmati Rice"
                  autoFocus
                  disabled={createMaterialMutation.isPending}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={createMaterialMutation.isPending}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMaterialMutation.isPending}
                  className="rounded-xl bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {createMaterialMutation.isPending ? "Adding..." : "Add Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
