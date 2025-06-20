import { Form, Button, Container } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
//import { assignments } from '../../Database';
import { useDispatch, useSelector } from "react-redux";
import { addAssignment, updateAssignment } from "./reducer";
import { useState } from "react";
import * as assignmentsClient from "./client";

export default function AssignmentEditor() {
  const { cid, aid } = useParams<{ cid: string; aid: string }>();
  const isNew = aid === "new";
  //const existing = assignments.find((a) => a._id === aid);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const existing = useSelector((s: any) =>
    s.assignmentsReducer.assignments.find((a: any) => a._id === aid)
  );

  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(
    existing?.description || ""
  );
  const [points, setPoints] = useState(existing?.points || 100);
  const [dueDate, setDueDate] = useState(existing?.due_date || "");
  const [availFrom, setAvailFrom] = useState(
    existing?.available_date || ""
  );
  const [availUntil, setAvailUntil] = useState(""); // no DB field

  async function onSave() {
    const payload = {
      title,
      description,
      points,
      due_date: dueDate,
      available_date: availFrom,
      submission_type: existing?.submission_type || "online",
      assignment_group: existing?.assignment_group || "ASSIGNMENTS",
      course: cid!,
    };
    try {
      if (isNew) {
        const newAssignment = await assignmentsClient.createAssignmentForCourse(cid!, payload);
        // 确保前端store中包含完整数据，即使后端只返回部分数据
        const completeAssignment = {
          ...payload,
          ...newAssignment,
          assignment_group: payload.assignment_group // 确保assignment_group字段存在
        };
        dispatch(addAssignment(completeAssignment));
      } else {
        const updatedAssignment = await assignmentsClient.updateAssignment({ _id: aid!, ...payload });
        const completeUpdatedAssignment = {
          ...payload,
          ...updatedAssignment,
          assignment_group: payload.assignment_group
        };
        dispatch(updateAssignment(completeUpdatedAssignment));
      }
      navigate(`/Kambaz/Courses/${cid}/Assignments`);
    } catch (error) {
      console.error("Error saving assignment:", error);
    }
  }
  return (
    <Container className="py-4" id="wd-assignments-editor">
      <Form>
        <Form.Group controlId="wd-name" className="mb-4">
          <Form.Label>Assignment Name</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="wd-description" className="mb-4">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>
        
        <Form.Group controlId="wd-points" className="mb-3">
            <Form.Label>Points</Form.Label>
            <Form.Control
              type="number"
              value={points}
              onChange={(e) => setPoints(+e.target.value)}
            />
          </Form.Group>
        
        <div className="border rounded p-3 mb-4">
          <Form.Label className="fw-bold mb-3">Assign</Form.Label>
        <Form.Group controlId="wd-due-date" className="mb-3">
          <Form.Label>Due</Form.Label>
          <Form.Control
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="wd-available-from" className="mb-3">
          <Form.Label>Available From</Form.Label>
          <Form.Control
            type="date"
            value={availFrom}
            onChange={(e) => setAvailFrom(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="wd-available-until" className="mb-3">
          <Form.Label>Until</Form.Label>
          <Form.Control
            type="date"
            value={availUntil}
            onChange={(e) => setAvailUntil(e.target.value)}
          />
        </Form.Group>
        </div>
        <div className="d-flex justify-content-end">
          <Button
            variant="secondary"
            className="me-2"
            onClick={() =>
              navigate(`/Kambaz/Courses/${cid}/Assignments`)
            }
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={onSave}>
            Save
          </Button>
        </div>
      </Form>
    </Container>
  );
}