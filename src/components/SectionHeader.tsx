interface SectionHeaderProps {
  title: string;
  hideAction?: boolean;
}

export default function SectionHeader({ title, hideAction }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-['IBM_Plex_Mono'] text-sm font-bold uppercase tracking-widest text-[#13f09c] flex items-center gap-3">
        <span
          className={`w-4 h-4 rounded-sm ${
            title.includes("Recent") ? "bg-[#13f09c]" : "bg-outline-variant"
          }`}
        ></span>
        {title}
      </h2>
      {!hideAction && (
        <button className="text-on-surface-variant hover:text-on-surface text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest">
          View All
        </button>
      )}
    </div>
  );
}
