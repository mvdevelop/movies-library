import React, { useEffect, useState } from "react";

import "./DarkMode.css";
import Sun from "../../assets/Sun.svg";
import Moon from "../../assets/Moon.svg";

const DarkMode = () => {
  const [isDark, setIsDark] = useState<boolean>(
    localStorage.getItem("selectedTheme") !== "light"
  );

  const setDarkTheme = () => {
    document.querySelector("body")?.setAttribute("data-theme", "dark");
    localStorage.setItem("selectedTheme", "dark");
    setIsDark(true);
  };

  const setLightTheme = () => {
    document.querySelector("body")?.setAttribute("data-theme", "light");
    localStorage.setItem("selectedTheme", "light");
    setIsDark(false);
  };

  // Inicializa o tema na primeira renderização
  useEffect(() => {
    const selectedTheme = localStorage.getItem("selectedTheme");
    if (selectedTheme === "light") {
      setLightTheme();
    } else {
      setDarkTheme();
    }
  }, []);

  const toggleTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setDarkTheme();
    } else {
      setLightTheme();
    }
  };

  return (
    <div className="dark_mode">
      <input
        className="dark_mode_input"
        type="checkbox"
        id="darkmode-toggle"
        onChange={toggleTheme}
        defaultChecked={isDark}
        aria-label="Alternar tema escuro/claro"
      />
      <label className="dark_mode_label" htmlFor="darkmode-toggle">
        <img src={Sun} alt="Sun" className="theme_icon" />
        <img src={Moon} alt="Moon" className="theme_icon" />
      </label>
    </div>
  );
};

export default DarkMode;
