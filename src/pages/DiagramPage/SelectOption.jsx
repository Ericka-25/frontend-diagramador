import React from 'react';

export const SelectOption = ({ options, value, onChange }) => {
  return (
    <select value={value} onChange={onChange} className="mx-1 rounded border border-gray-600 form-select bg-[#FFFA] text-black">
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
