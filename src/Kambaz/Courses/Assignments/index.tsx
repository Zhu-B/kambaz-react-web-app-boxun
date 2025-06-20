import { Modal, Button, ListGroup } from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import { deleteAssignment, setAssignments } from "./reducer";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as assignmentsClient from "./client";
import { FaSearch } from "react-icons/fa";
import { MdDragIndicator } from "react-icons/md";
import { IoTrash } from "react-icons/io5";

export default function Assignments() {
  const { cid } = useParams();
  const { assignments } = useSelector((state: any) => state.assignmentsReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [toDelete, setToDelete] = useState<string | null>(null);  
  const fetchAssignments = async () => {
    try {
      const assignmentsData = await assignmentsClient.fetchAssignmentsForCourse(cid as string);
      if (import.meta.env.DEV) {
        console.log("Fetched assignments data:", assignmentsData);
      }
      dispatch(setAssignments(assignmentsData));
    } catch (error) {
      console.error("Error fetching assignments:", error);
      dispatch(setAssignments([]));
    }
  };
  useEffect(() => {
    if (cid) {
      fetchAssignments();
    }
  }, [cid]);
  return (
    <div id="wd-assignments">
      <div className="mb-3">
        <FaSearch className="position-absolute text-secondary"/>
        <input
          placeholder="Search for Assignments"
          id="wd-search-assignment"
          className="ps-5"
          style={{ width: 250 }}
        />
           
        <button 
          id="wd-add-assignment"
          className="btn btn-danger float-end"
          onClick={() => navigate(`/Kambaz/Courses/${cid}/Assignments/new`)}
        >
          + Assignment
        </button>
      </div>

      <ListGroup className="rounded-0">
        <ListGroup.Item className="wd-module p-0 mb-5 fs-5 border-gray">
          <div className="wd-title p-3 ps-2 bg-secondary d-flex align-items-center">
            <MdDragIndicator className="me-2 fs-3" />
            <span className="fw-bold flex-grow-1">
              ASSIGNMENTS
            </span>
          </div>

          <ListGroup className="wd-assignments rounded-0">
            {assignments.map((assignment: any) => (
              <ListGroup.Item key={assignment._id} className="p-3 ps-1 d-flex align-items-center wd-assignment">
                <MdDragIndicator className="me-2 fs-3" />
                <span className="flex-grow-1">
                  <Link
                    to={`/Kambaz/Courses/${cid}/Assignments/${assignment._id}`}
                    className="wd-assignment-link text-decoration-none text-dark"
                  >
                    {assignment.title}
                  </Link>
                  <br />
                  <h6>
                    {assignment.description?.slice(0, 30)}… | {assignment.points || 0} pts
                    <br />
                    Due {assignment.due_date || "No due date"}
                  </h6>
                </span>
                <IoTrash
                  className="fs-4 text-danger ms-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => setToDelete(assignment._id)}
                />
              </ListGroup.Item>
            ))}

            {assignments.length === 0 && (
              <ListGroup.Item className="text-center">
                No assignments found.
              </ListGroup.Item>
            )}
          </ListGroup>
        </ListGroup.Item>
      </ListGroup>

      <Modal show={!!toDelete} onHide={() => setToDelete(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Assignment?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to remove this assignment?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setToDelete(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              try {
                await assignmentsClient.deleteAssignment(toDelete!);
                dispatch(deleteAssignment(toDelete!));
                setToDelete(null);
              } catch (error) {
                console.error("Error deleting assignment:", error);
                setToDelete(null);
              }
            }}
          >
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}