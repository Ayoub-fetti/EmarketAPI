import { MdSearch } from "react-icons/md";

export default function SearchBar({
  placeholder = "Rechercher...",
  value,
  onChange,
}) {
  return (
    <div className="relative flex-1 lg:max-w-md">
      <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none"
      />
    </div>
  );
}
