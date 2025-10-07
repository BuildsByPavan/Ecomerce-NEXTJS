"use client"

export default function InputField({ label, type, placeholder, value, onChange }) {
    return (
        <div className="flex flex-col mb-4">
            {label && <label className="mb-1 text-sm text-gray-900">{label}</label>}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className=" px-0 py-2 border-b border-gray-900  bg-transparent  
                 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 "/>
        </div>
    )
}
