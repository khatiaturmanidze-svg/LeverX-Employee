import React from "react";

export default function RequestForm(): React.ReactElement {
  return (
    <div className="request-form card">
      <img
        src="../assets/vacation-bg.jpg"
        alt="vacation picture"
        className="request-form__img"
      />
      <h2 className="request-form__title">New Request</h2>

      <form className="request-form__content">
        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select id="type" className="request-list__select">
            <option>Vacation</option>
            <option>Sick leave</option>
            <option>Military leave</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            <input type="date" />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input type="date" />
          </div>
        </div>

        <div className="form-group">
          <label>Note</label>
          <textarea placeholder="Reason for leave..."></textarea>
        </div>

        <button type="submit" className="btn-submit">
          Submit Request
        </button>
      </form>
    </div>
  );
}
