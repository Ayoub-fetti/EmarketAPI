

export default function FilterSelect({
  options,
  placeholder = "Tous les statuts",
  value,
  onChange,
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 text-sm focus:outline-none "
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
