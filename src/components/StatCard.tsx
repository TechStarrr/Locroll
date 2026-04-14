interface StatCardProps {
  title: string;
  value: string;
  unit?: string;
  icon: string;
  status?: string;
  pending?: boolean;
  yieldText?: string;
  italic?: boolean;
}

export default function StatCard({
  title,
  value,
  unit,
  icon,
  status,
  pending,
  yieldText,
  italic,
}: StatCardProps) {
  return (
    <div className="bg-surface-container-low rounded-xl p-6 relative overflow-hidden group hover:bg-surface-container-high transition-colors">
      {yieldText && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#13f09c]/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      )}
      <div className="flex justify-between items-start mb-6">
        <span className="font-['IBM_Plex_Mono'] text-[10px] text-on-surface-variant tracking-widest uppercase">
          {title}
        </span>
        <div
          className={`${
            icon === "history" || icon === "groups"
              ? "bg-surface-container-highest"
              : "bg-primary-container/10"
          } p-2 rounded-lg`}
        >
          <span
            className={`material-symbols-outlined ${
              icon === "history" || icon === "groups"
                ? "text-on-surface-variant"
                : "text-[#13f09c]"
            }`}
          >
            {icon}
          </span>
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className={`text-4xl font-black text-on-surface tracking-tighter ${
            italic ? "italic text-sm text-on-surface-variant font-mono" : ""
          }`}
        >
          {value}
        </span>
        {unit && (
          <span className="text-on-surface-variant font-['IBM_Plex_Mono'] text-xs">
            {unit}
          </span>
        )}
      </div>
      {status && (
        <div className="mt-4 flex items-center text-[10px] text-[#13f09c] font-bold">
          <span className="material-symbols-outlined text-xs mr-1">
            check_circle
          </span>
          <span>{status}</span>
        </div>
      )}
      {pending && (
        <div className="mt-4 flex items-center">
          <div className="bg-surface-variant px-3 py-1 rounded-full text-[10px] font-['IBM_Plex_Mono'] text-on-surface-variant flex items-center">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
            PENDING_KYC
          </div>
        </div>
      )}
      {yieldText && (
        <div className="mt-4 flex items-center text-xs font-bold">
          <span className="text-[#13f09c]">{yieldText}</span>
          <span className="mx-2 text-on-surface-variant">/</span>
          <span className="text-on-surface-variant font-['IBM_Plex_Mono'] text-[10px]">
            REAL_TIME_ACCUAL
          </span>
        </div>
      )}
      {icon === "history" && (
        <div className="mt-8 h-1 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-[#13f09c]/20 w-0"></div>
        </div>
      )}
    </div>
  );
}
