// utils/stringUtils.js

/**
 * Capitalizes the first letter of a string
 * @param {string} str - input string
 * @returns {string} - string with first letter capitalized
 */
export const capitalizeEachWord = (str = "") => {
  if (!str) return "";
  return str
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
