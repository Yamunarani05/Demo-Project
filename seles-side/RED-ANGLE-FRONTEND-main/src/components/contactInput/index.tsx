import { useState, useEffect } from "react";
import { validatePhone, type Country } from "./country.service";
import countriesData from "./countries.json";

interface ContactInputProps {
    value: string;
    onChange: (value: string) => void;
    onValidationChange?: (valid: boolean) => void;
    required?: boolean;
}

const ContactInput = ({
    value,
    onChange,
    onValidationChange,
    required = false,
}: ContactInputProps) => {
    const [countries] = useState<Country[]>(countriesData as Country[]);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(
        (countriesData.find((c) => c.code === "IN") as Country) || (countriesData[0] as Country)
    );

    // Run validation on mount if value exists
    useEffect(() => {
        if (value && selectedCountry) {
            const digits = value.replace(/\D/g, "");
            runValidation(digits, selectedCountry);
        }
    }, []);

    /** 🔑 Central validator */
    const runValidation = (digits: string, country: Country | null) => {
        if (!digits || !country) {
            onValidationChange?.(false);
            return;
        }

        const valid = validatePhone(digits, country.code);
        onValidationChange?.(valid);
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, "");
        onChange(digits);
        runValidation(digits, selectedCountry);
    };

    const handleCountryChange = (code: string) => {
        const country = countries.find((c) => c.code === code) || null;
        setSelectedCountry(country);
        runValidation(value, country);
    };

    return (
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 py-1">
            {/* Country Select */}
            <select
                className="outline-none bg-transparent text-xs max-w-[80px] px-1
                   focus:ring-1 focus:ring-blue-400"
                value={selectedCountry?.code || ""}
                onChange={(e) => handleCountryChange(e.target.value)}
            >
                {/* Closed state: show only dial code */}
                {selectedCountry && (
                    <option value={selectedCountry.code} hidden>
                        {selectedCountry.dialCode}
                    </option>
                )}

                {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                        ({c.dialCode}) {c.name}
                    </option>
                ))}
            </select>

            {/* Phone Input */}
            <input
                type="tel"
                className="flex-1 outline-none text-xs"
                placeholder="Enter phone number"
                value={value}
                onChange={handleNumberChange}
                required={required}
            />
        </div>
    );
};

export default ContactInput;
