"use client";

import { MyContext } from "@/context/MyContext";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import Select from "react-select";
import Flag from "react-world-flags";

const countryOptions = [
  { value: "US", label: "United States" },
  { value: "IN", label: "India" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "IT", label: "Italy" },
  { value: "ES", label: "Spain" },
  { value: "MX", label: "Mexico" },
  { value: "BR", label: "Brazil" },
  { value: "JP", label: "Japan" },
  { value: "CN", label: "China" },
  { value: "RU", label: "Russia" },
  { value: "KR", label: "South Korea" },
  { value: "ZA", label: "South Africa" },
  { value: "NG", label: "Nigeria" },
  { value: "EG", label: "Egypt" },
  { value: "AR", label: "Argentina" },
  { value: "TR", label: "Turkey" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "SE", label: "Sweden" },
  { value: "NO", label: "Norway" },
  { value: "FI", label: "Finland" },
  { value: "PL", label: "Poland" },
  { value: "NL", label: "Netherlands" },
  { value: "CH", label: "Switzerland" },
  { value: "BE", label: "Belgium" },
  { value: "AT", label: "Austria" },
  { value: "TH", label: "Thailand" },
  { value: "PT", label: "Portugal" },
  { value: "GR", label: "Greece" },
  { value: "IL", label: "Israel" },
  { value: "SG", label: "Singapore" },
  { value: "MY", label: "Malaysia" },
  { value: "ID", label: "Indonesia" },
  { value: "PH", label: "Philippines" },
  { value: "VN", label: "Vietnam" },
  { value: "NZ", label: "New Zealand" },
  { value: "DK", label: "Denmark" },
  { value: "HU", label: "Hungary" },
  { value: "CZ", label: "Czech Republic" },
  { value: "SK", label: "Slovakia" },
  { value: "IE", label: "Ireland" },
  { value: "RO", label: "Romania" },
  { value: "BG", label: "Bulgaria" },
  { value: "UA", label: "Ukraine" },
  { value: "BY", label: "Belarus" },
  { value: "KZ", label: "Kazakhstan" },
  { value: "UZ", label: "Uzbekistan" },
  { value: "PK", label: "Pakistan" },
  { value: "BD", label: "Bangladesh" },
  { value: "LK", label: "Sri Lanka" },
  { value: "NP", label: "Nepal" },
  { value: "AF", label: "Afghanistan" },
  { value: "IR", label: "Iran" },
  { value: "IQ", label: "Iraq" },
  { value: "SY", label: "Syria" },
  { value: "LB", label: "Lebanon" },
  { value: "JO", label: "Jordan" },
  { value: "QA", label: "Qatar" },
  { value: "KW", label: "Kuwait" },
  { value: "OM", label: "Oman" },
  { value: "BH", label: "Bahrain" },
  { value: "YE", label: "Yemen" },
  { value: "MA", label: "Morocco" },
  { value: "DZ", label: "Algeria" },
  { value: "TN", label: "Tunisia" },
  { value: "LY", label: "Libya" },
  { value: "SD", label: "Sudan" },
  { value: "ET", label: "Ethiopia" },
  { value: "KE", label: "Kenya" },
  { value: "TZ", label: "Tanzania" },
  { value: "UG", label: "Uganda" },
  { value: "GH", label: "Ghana" },
  { value: "CI", label: "Ivory Coast" },
  { value: "CM", label: "Cameroon" },
  { value: "SN", label: "Senegal" },
  { value: "MG", label: "Madagascar" },
  { value: "ZM", label: "Zambia" },
  { value: "ZW", label: "Zimbabwe" },
  { value: "MW", label: "Malawi" },
  { value: "BO", label: "Bolivia" },
  { value: "CL", label: "Chile" },
  { value: "CO", label: "Colombia" },
  { value: "VE", label: "Venezuela" },
  { value: "PE", label: "Peru" },
  { value: "UY", label: "Uruguay" },
  { value: "PY", label: "Paraguay" },
  { value: "CU", label: "Cuba" },
  { value: "DO", label: "Dominican Republic" },
  { value: "JM", label: "Jamaica" },
  { value: "HT", label: "Haiti" },
  { value: "CR", label: "Costa Rica" },
  { value: "GT", label: "Guatemala" },
  { value: "HN", label: "Honduras" },
  { value: "SV", label: "El Salvador" },
  { value: "PA", label: "Panama" },
  { value: "BZ", label: "Belize" },
  { value: "BB", label: "Barbados" },
];

const languageOptions = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ar", label: "Arabic" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
];

const CountryFlagOption = ({ data }) => {
  return (
    <div className="flex items-center">
      <Flag
        code={data.value}
        style={{ width: 20, height: 15, marginRight: 8 }}
      />
      {data.label}
    </div>
  );
};

const Navbar = () => {
  const [loading, setLoading] = useState(false);
  const {
    user,
    setSelectedCountry,
    selectedCountry,
    setSelectedLanguage,
    setSelectedChat,
    selectedLanguage,
  } = useContext(MyContext);

  const handleCountryChange = async (selectedOption) => {
    setSelectedCountry(selectedOption);
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/update/${user.userId}`,
        {
          // const response = await fetch(`http://localhost:5000/api/users/update/${user.userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ country: selectedOption }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update country");
      }

      console.log("Country updated successfully");
    } catch (error) {
      console.error("Error updating country:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (selectedOption) => {
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/update/${user.userId}`,
        // const response = await fetch(`http://localhost:5000/api/users/update/${user.userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ language: selectedOption }),
        }
      );
      setSelectedLanguage(selectedOption);
      setSelectedChat(null);

      if (!response.ok) {
        throw new Error("Failed to update language");
      }

      console.log("Language updated successfully");
    } catch (error) {
      console.error("Error updating language:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-lg font-bold">Juristo</div>

        <div className="flex space-x-6 items-center">
          <Select
            options={countryOptions}
            onChange={handleCountryChange}
            value={selectedCountry}
            getOptionLabel={(e) => <CountryFlagOption data={e} />}
            className="w-40 text-black"
            menuPlacement="top"
          />
          <Select
            options={languageOptions}
            onChange={handleLanguageChange}
            value={selectedLanguage}
            className="w-40 text-black"
            menuPlacement="top"
          />
          <Link href="/">
            <p className="hover:text-yellow-400 transition-colors">Chat</p>
          </Link>
          <Link href="/docs-upload">
            <p className="hover:text-yellow-400 transition-colors">Analysis</p>
          </Link>
          <Link href="/get-legal-doc">
            <p className="hover:text-yellow-400 transition-colors">Drafting</p>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
