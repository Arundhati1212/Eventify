import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", { id }],
    queryFn: ({ signal }) => {
      return fetchEvent({ id, signal });
    },
  });
  const {
    mutate,
    isPending: isPendingDelete,
    isError: isErrorDelete,
    error: errorDelete,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  function startDelete() {
    setIsDeleting(true);
  }
  function stopDelete() {
    setIsDeleting(false);
  }

  function handleDelete() {
    mutate({ id });
  }
  return (
    <>
      {isDeleting && (
        <Modal onClose={stopDelete}>
          <h2>Are you sure????</h2>
          <p>Once deleted action cannot be undone</p>
          <div className="form-actions">
            {isPendingDelete && <p>Please wait... deleting event..</p>}
            {!isPendingDelete && (
              <>
                <button onClick={handleDelete} className="button">
                  Delete
                </button>
                <button onClick={stopDelete} className="button-text">
                  Cancel
                </button>
              </>
            )}
            {isErrorDelete && (
              <ErrorBlock
                title="An error occured"
                message={errorDelete.info?.message || "Error with Fetching"}
              />
            )}
          </div>
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isPending && <p>Loading Details...</p>}
      {isError && (
        <ErrorBlock
          title="An error occured"
          message={error.info?.message || "Error with Fetching"}
        />
      )}
      {!isPending && !isError && (
        <article id="event-details">
          <header>
            <h1>{data.title}</h1>
            <nav>
              <button onClick={startDelete}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img src={`http://localhost:3000/${data.image}`} alt="" />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>
                  {data.date} @ {data.time}
                </time>
              </div>
              <p id="event-details-description">{data.description}</p>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
