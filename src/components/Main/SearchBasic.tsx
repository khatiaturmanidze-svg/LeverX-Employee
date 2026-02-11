import React, { useState } from 'react';

export interface SearchCriteria {
  fullname: string;
}

interface BasicSearchFormProps {
  onSearchSubmit: (criteria: SearchCriteria) => void;
}

export default function SearchBasic({
  onSearchSubmit,
}: BasicSearchFormProps): React.ReactElement {
  const [fullname, setFullname] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const criteria: SearchCriteria = {
      fullname,
    };

    setFullname('');
    onSearchSubmit(criteria);
  };
  return (
    <form className="search-form__basic" onSubmit={handleSearch}>
      <input
        type="text"
        name="user"
        placeholder="Full Name"
        className="user-input search-form__basic-full"
        value={fullname}
        onChange={(e) => setFullname(e.target.value)}
      />

      <button
        type="submit"
        className="search__btn-submit search-form__basic-submit"
      >
        search
      </button>
    </form>
  );
}
