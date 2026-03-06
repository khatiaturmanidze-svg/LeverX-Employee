import React from "react";

export default function RequestForm(): React.ReactElement {
  return (
    <div className="request-form card">
      <p>New Request</p>

      <form>
        <label>Type</label>
        <select>
          <option>Vacation</option>
          <option>Sick leave</option>
          <option>Military leave</option>
        </select>
        <p>date</p>
        <p>date</p>

        <textarea></textarea>
      </form>
    </div>
  );
}
