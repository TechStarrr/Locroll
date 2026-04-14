interface NavItemProps {
  icon: string;
  label: string;
}

export default function NavItem({ icon, label }: NavItemProps) {
  return (
    <a
      className="flex items-center px-8 py-3 text-[#dce1fb]/50 hover:bg-[#13f09c]/5 hover:text-[#13f09c] transition-all duration-150 ease-in-out"
      href="#"
    >
      <span className="material-symbols-outlined mr-4 text-lg">{icon}</span>
      <span>{label}</span>
    </a>
  );
}
