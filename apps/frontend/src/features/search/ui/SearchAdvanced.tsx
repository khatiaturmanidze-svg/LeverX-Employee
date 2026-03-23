import React, { useReducer } from 'react';

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

type SearchAction =
  | {
      type: 'SET_FIELD';
      field: keyof AdvancedSearchCriteria;
      value: string;
    }
  | { type: 'RESET' };

const initialSearchState: AdvancedSearchCriteria = {
  name: '',
  email: '',
  phone: '',
  zoom: '',
  building: 'any',
  room: '',
  department: 'Any',
};

function searchReducer(
  state: AdvancedSearchCriteria,
  action: SearchAction,
): AdvancedSearchCriteria {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialSearchState;
    default:
      return state;
  }
}

export default function SearchAdvanced({
  onSearchSubmit,
}: SearchAdvancedProps): React.ReactElement {
  const [state, dispatch] = useReducer(searchReducer, initialSearchState);
  const { name, email, phone, zoom, building, room, department } = state;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(state);
    dispatch({ type: 'RESET' });
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
          onChange={(e) =>
            dispatch({
              type: 'SET_FIELD',
              field: 'name',
              value: e.target.value,
            })
          }
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
          onChange={(e) =>
            dispatch({
              type: 'SET_FIELD',
              field: 'email',
              value: e.target.value,
            })
          }
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
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'phone',
                value: e.target.value,
              })
            }
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
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'zoom',
                value: e.target.value,
              })
            }
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
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'building',
                value: e.target.value,
              })
            }
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
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'room',
                value: e.target.value,
              })
            }
          />
        </div>
      </div>
      <div className="flex-column">
        <select
          id="department"
          className="user-input"
          value={department}
          onChange={(e) =>
            dispatch({
              type: 'SET_FIELD',
              field: 'department',
              value: e.target.value,
            })
          }
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
