
      // src/components/SearchBar.js
      import React, { useState } from 'react';

      function SearchBar({ onSearch }) {
        const [searchTerm, setSearchTerm] = useState('');

        const handleChange = (event) => {
          setSearchTerm(event.target.value);
          onSearch(event.target.value); // Propagate the search term up
        };

        return (
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleChange}
          />
        );
      }

      export default SearchBar;
    