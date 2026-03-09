import React from "react";
import { Header } from "../components/reusable/Header";
import { getLoggedInUser } from "../utils/core";
import { useGetUsersQuery } from "../features/usersApi";
import Managers from "../components/Requests/Managers";
import RequestForm from "../components/Requests/RequestForm";
import RequestList from "../components/Requests/RequestList";

export default function Requests(): React.ReactElement {
  const { data: allUsers = [] } = useGetUsersQuery();
  const loggedInUser = getLoggedInUser(allUsers);
  const isAdmin = loggedInUser?.role === "Admin";
  return (
    <div className="page">
      <Header loggedInUser={loggedInUser || null} isAdmin={isAdmin} />{" "}
      <div className="requests-grid">
        <Managers loggedInUser={loggedInUser} />
        <RequestForm />
        <RequestList />
      </div>
    </div>
  );
}
