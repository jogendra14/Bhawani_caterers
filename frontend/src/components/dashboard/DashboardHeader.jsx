export default function DashboardHeader({ user, onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
            aria-label="Open menu"
          >
            ☰
          </button>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Welcome back
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {user?.name || 'Administrator'}
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <div className="h-9 w-9 rounded-full bg-slate-900 text-center text-sm font-bold leading-9 text-white">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{user?.email || ''}</p>
            <p className="text-xs capitalize text-slate-400">{user?.role || 'admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
