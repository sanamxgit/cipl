import React, { createContext, useState, useContext } from 'react';

const FeaturedContext = createContext();

export const FeaturedProvider = ({ children }) => {
  const [selectedFeaturedBrand, setSelectedFeaturedBrand] = useState(null);

  return (
    <FeaturedContext.Provider value={{ selectedFeaturedBrand, setSelectedFeaturedBrand }}>
      {children}
    </FeaturedContext.Provider>
  );
};

export const useFeatured = () => useContext(FeaturedContext); 