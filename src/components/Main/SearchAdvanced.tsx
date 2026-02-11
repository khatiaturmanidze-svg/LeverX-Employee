import React, { useState } from 'react';

export interface AdvancedSearchCriteria {
  name: string;
  email: string;
  phone: string;
  zoom: string;
  building: string;
  room: string;
  department: string;
}

interface SearchAdvancedProps {
  onSearchSubmit: (criteria: AdvancedSearchCriteria) => void;
}

export default function SearchAdvanced({
  onSearchSubmit,
}: SearchAdvancedProps): React.ReactElement {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [zoom, setZoom] = useState('');
  const [building, setBuilding] = useState('any');
  const [room, setRoom] = useState('');
  const [department, setDepartment] = useState('Any');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const criteria: AdvancedSearchCriteria = {
      name,
      email,
      phone,
      zoom,
      building,
      room,
      department,
    };

    setName('');
    setEmail('');
    setPhone('');
    setZoom('');
    setBuilding('any');
    setRoom('');
    setDepartment('Any');
    onSearchSubmit(criteria);
  };
  return (
    <form className="search-form__advanced " onSubmit={handleSearch}>
      <div className="flex-column">
        <input
          type="text"
          name="name"
          placeholder="Name"
          id="name"
          className="user-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="flex-column">
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Email"
          className="user-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="grid-row-1-2">
        <div className="flex-column">
          <input
            type="tel"
            name="phone"
            id="phone"
            placeholder="Phone"
            className="user-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="flex-column">
          <input
            type="text"
            name="zoom"
            id="zoom"
            placeholder="Zoom ID"
            className="user-input"
            value={zoom}
            onChange={(e) => setZoom(e.target.value)}
          />
        </div>
      </div>
      <div className="grid-row-2-3">
        <div className="flex-column building-input">
          <label htmlFor="building">Building</label>
          <select
            name="building"
            id="building"
            className="user-input"
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
          >
            <option value="any">Any</option>
          </select>
        </div>

        <div className="flex-column">
          \{' '}
          <input
            type="text"
            name="room"
            id="room"
            placeholder="Room"
            className="user-input"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-column">
        <select
          id="department"
          className="user-input"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option>Any</option>
        </select>
      </div>

      <button
        type="submit"
        className="search__btn-submit search-form__advanced-submit"
      >
        submit
      </button>
    </form>
  );
}
